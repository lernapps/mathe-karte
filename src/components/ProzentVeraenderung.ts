// Übung „Prozentuale Zunahme und Abnahme“: neuer Wert gesucht (alter Wert · Faktor) oder alter Wert gesucht (neuer Wert
// : Faktor), in fünf Kontexten (Ticket, Rabatt, Mehrwertsteuer, Gehalt, Sportverein), mit Balken für alten und neuen
// Wert. Portiert aus aufgaben/veraenderung.js der alten App.
import {
  type Antworten,
  type Aufgabe,
  PROZENTSAETZE,
  RABATTE,
  beschreibe,
  bildWert,
  check,
  eingabeFuer,
  grundFuer,
  solution,
  waehleGrundwert,
  zahlenfeld,
} from "./ProzentAufgabe.ts";
import {
  type Bruch,
  alsBruch,
  artFuer,
  bruch,
  durch,
  erzeugeZufall,
  formatGenau,
  formatWert,
  formatZahl,
  gleichheitszeichen,
  mal,
  minus,
  mitEinheit,
  passtZu,
  plus,
  runde,
  zahl,
} from "./ProzentKern.ts";

export { check, solution };

type Richtung = "plus" | "minus";
type Typ = "neu" | "alt";
interface Kontext {
  id: string;
  einheit: string;
  min: number;
  max: number;
  nachkomma: number;
  schritt: number;
  richtung: Richtung;
  preis: boolean;
  saetze?: readonly number[];
  neu: (alt: string, p: string) => string;
  alt: (neu: string, p: string) => string;
}

const KONTEXTE: readonly Kontext[] = [
  {
    id: "ticket",
    einheit: "€",
    min: 20,
    max: 500,
    nachkomma: 1,
    schritt: 5,
    richtung: "plus",
    preis: true,
    neu: (alt, p) => `Ein Konzertticket kostet ${alt}. Der Preis steigt um ${p}. Wie viel kostet es danach?`,
    alt: (neu, p) =>
      `Der Preis eines Konzerttickets steigt um ${p}. Danach kostet es ${neu}. Wie viel hat es vorher gekostet?`,
  },
  {
    id: "rabatt",
    einheit: "€",
    min: 20,
    max: 120,
    nachkomma: 1,
    schritt: 5,
    richtung: "minus",
    preis: true,
    saetze: RABATTE,
    neu: (alt, p) => `Eine Hose kostet ${alt}. Im Ausverkauf gibt es ${p} Rabatt. Wie viel kostet sie jetzt?`,
    alt: (neu, p) => `Nach ${p} Rabatt kostet eine Hose ${neu}. Wie viel hat sie vorher gekostet?`,
  },
  {
    id: "mwst",
    einheit: "€",
    min: 100,
    max: 1500,
    nachkomma: 0,
    schritt: 100,
    richtung: "plus",
    preis: true,
    saetze: [19],
    neu: (alt) => `Ein Fahrrad kostet netto ${alt}. Dazu kommen 19 % Mehrwertsteuer. Wie viel kostet es brutto?`,
    alt: (neu) =>
      `Ein Fahrrad kostet brutto ${neu}. Darin sind 19 % Mehrwertsteuer enthalten. Wie hoch ist der Nettopreis?`,
  },
  {
    id: "gehalt",
    einheit: "€",
    min: 2000,
    max: 5000,
    nachkomma: 0,
    schritt: 100,
    richtung: "plus",
    preis: false,
    neu: (alt, p) => `Frau Berg verdient ${alt} im Monat. Sie bekommt ${p} mehr. Wie viel verdient sie danach?`,
    alt: (neu, p) =>
      `Nach einer Gehaltserhöhung um ${p} verdient Frau Berg ${neu} im Monat. Wie viel hat sie vorher verdient?`,
  },
  {
    id: "verein",
    einheit: "Mitglieder",
    min: 50,
    max: 1000,
    nachkomma: 0,
    schritt: 10,
    richtung: "minus",
    preis: false,
    neu: (alt, p) =>
      `Ein Sportverein hat ${alt}. Im nächsten Jahr sinkt die Zahl um ${p}. Wie viele Mitglieder hat er dann?`,
    alt: (neu, p) =>
      `Die Mitgliederzahl eines Sportvereins ist um ${p} gesunken. Jetzt hat er ${neu}. Wie viele Mitglieder hatte er vorher?`,
  },
];
const SAETZE = PROZENTSAETZE.filter((p) => p <= 50);

export interface VeraenderungAufgabe extends Aufgabe {
  typ: Typ;
  richtung: Richtung;
  alt: number;
  neu: number;
  prozentsatz: number;
}

/** Der Faktor 1 ± p/100, exakt. */
const faktorVon = (richtung: Richtung, p: number): Bruch =>
  (richtung === "plus" ? plus : minus)(bruch(1), durch(alsBruch(p), bruch(100)));

export function generate(seed: number): VeraenderungAufgabe {
  const zufall = erzeugeZufall(seed, "veraenderung");
  const typ = zufall.wahl<Typ>(["neu", "alt"]);
  const k = zufall.wahl(KONTEXTE);
  const p = zufall.wahl(k.saetze ?? SAETZE);
  const alt = waehleGrundwert(zufall, p, k) ?? k.min;
  const faktor = faktorVon(k.richtung, p);
  const neu = runde(alt * zahl(faktor), k.nachkomma);
  const einheit = k.einheit;
  const exakt = typ === "neu" ? mal(alsBruch(alt), faktor) : durch(alsBruch(neu), faktor);
  const zeichen = "+−"[k.richtung === "plus" ? 0 : 1] ?? "+";
  // der Faktor steht ungerundet (1,125, nicht 1,13): mit genau dieser Zahl rechnet man weiter
  const f = formatGenau(zahl(faktor));
  const ergebnis = typ === "neu" ? neu : alt;
  const gl = gleichheitszeichen(zahl(exakt), ergebnis);
  const neuProzent = k.richtung === "plus" ? 100 + p : 100 - p;
  const wort = k.preis ? "Preis" : "Wert";
  const balken = (geloest: boolean) => {
    const altBekannt = typ === "neu" || geloest;
    const neuBekannt = typ === "alt" || geloest;
    return {
      art: "balken" as const,
      titel: `${zeichen} ${formatZahl(p)} %`,
      balken: [
        {
          wert: altBekannt ? alt : null,
          grau: true,
          text: `Alter ${wort} (100 %): ${altBekannt ? bildWert(alt, einheit) : "?"}`,
        },
        {
          wert: neuBekannt ? neu : null,
          grau: false,
          text: neuBekannt
            ? `Neuer ${wort} (${formatZahl(neuProzent)} %): ${bildWert(neu, einheit)}`
            : `Neuer ${wort}: ?`,
        },
      ],
    };
  };
  const pText = mitEinheit(p, "%");
  return {
    typ,
    richtung: k.richtung,
    alt,
    neu,
    prozentsatz: p,
    text: typ === "neu" ? k.neu(mitEinheit(alt, einheit), pText) : k.alt(mitEinheit(neu, einheit), pText),
    felder: [zahlenfeld(typ, typ === "neu" ? "Neuer Wert" : "Alter Wert", einheit, artFuer(einheit), exakt)],
    bild: balken(false),
    bildGeloest: balken(true),
    tipp:
      typ === "neu"
        ? `Der alte Wert (${mitEinheit(alt, einheit)}) ist 100 %. Nach der Änderung sind es ${formatZahl(neuProzent)} %. Rechne den Prozentwert aus und ${k.richtung === "plus" ? "addiere" : "subtrahiere"} ihn – oder nimm gleich den Faktor ${f}.`
        : `Vorsicht: Die ${formatZahl(p)} % beziehen sich auf den alten Wert, nicht auf ${mitEinheit(neu, einheit)}. Der neue Wert entspricht ${formatZahl(neuProzent)} %. Teile durch den Faktor ${f}.`,
    rechenweg:
      typ === "neu"
        ? [
            `Neuer Wert = alter Wert · (1 ${zeichen} p/100)`,
            `Faktor: 1 ${zeichen} ${formatZahl(p)}/100 = ${f}`,
            `${formatWert(alt, einheit)} · ${f} ${gl} ${mitEinheit(neu, einheit)}`,
          ]
        : [
            `Alter Wert = neuer Wert : (1 ${zeichen} p/100)`,
            `Faktor: 1 ${zeichen} ${formatZahl(p)}/100 = ${f}`,
            `${formatWert(neu, einheit)} : ${f} ${gl} ${mitEinheit(alt, einheit)}`,
          ],
    richtig: `Ergebnis: ${mitEinheit(ergebnis, einheit)}.`,
  };
}

export const MELDUNGEN = {
  richtungVerwechselt: "Du hast in die falsche Richtung gerechnet. Lies noch einmal: steigt oder sinkt der Wert?",
  nurProzentwert:
    "Das ist nur die Veränderung (der Prozentwert). Gefragt ist der neue Wert: alter Wert plus/minus Veränderung.",
  grundwertNeuerWert:
    "Die Prozente beziehen sich auf den alten Wert, nicht auf den neuen. Der neue Wert ist nicht 100 %.",
  falsch: "Das stimmt noch nicht. Bestimme zuerst den Faktor (1 plus/minus p/100) und rechne dann.",
};

/** Der Wert, um p % in die falsche Richtung verändert. */
function gegenRichtung(aufgabe: VeraenderungAufgabe, basis: number): Bruch {
  const andere: Richtung = aufgabe.richtung === "plus" ? "minus" : "plus";
  return mal(alsBruch(basis), faktorVon(andere, aufgabe.prozentsatz));
}

/** Was an einer falschen Antwort falsch ist. */
export function grund(aufgabe: VeraenderungAufgabe, antwort: unknown): string {
  const [feld] = aufgabe.felder;
  if (feld?.typ !== "zahl") return MELDUNGEN.falsch;
  return grundFuer(
    aufgabe,
    antwort,
    (antworten: Antworten) => {
      const eingabe = antworten[aufgabe.typ];
      const anteil = durch(mal(alsBruch(aufgabe.alt), alsBruch(aufgabe.prozentsatz)), bruch(100));
      if (aufgabe.typ === "neu" && passtZu(eingabe, gegenRichtung(aufgabe, aufgabe.alt), feld.art))
        return MELDUNGEN.richtungVerwechselt;
      if (aufgabe.typ === "neu" && passtZu(eingabe, anteil, feld.art)) return MELDUNGEN.nurProzentwert;
      if (aufgabe.typ === "alt" && passtZu(eingabe, gegenRichtung(aufgabe, aufgabe.neu), feld.art))
        return MELDUNGEN.grundwertNeuerWert;
      return undefined;
    },
    MELDUNGEN.falsch,
  );
}

/** Die typische falsche Antwort: in die falsche Richtung gerechnet, rückwärts mit den Prozenten vom neuen Wert. */
export function wrong(aufgabe: VeraenderungAufgabe): Antworten {
  const basis = aufgabe.typ === "neu" ? aufgabe.alt : aufgabe.neu;
  return { [aufgabe.typ]: eingabeFuer(zahl(gegenRichtung(aufgabe, basis))) };
}

export function describe(aufgabe: VeraenderungAufgabe): { task: string; solution: string } {
  return beschreibe(aufgabe);
}

export const about = {
  task: "Eine Textaufgabe zu einer Erhöhung oder Senkung um p %: entweder der neue Wert gesucht (alter Wert gegeben) oder der alte Wert gesucht (neuer Wert gegeben). Das Bild zur Aufgabe zeigt alten und neuen Wert als Balken, der gesuchte mit „?“.",
  answer:
    "Eine Zahl in der Einheit des Textes (Euro oder Mitglieder); Komma oder Punkt, ein Bruch oder ein Term gehen auch.",
  correct:
    "Neuer Wert = alter Wert · (1 ± p/100), alter Wert = neuer Wert : (1 ± p/100); exakt oder kaufmännisch gerundet (Euro auf Cent).",
  mistakes: [MELDUNGEN.richtungVerwechselt, MELDUNGEN.nurProzentwert, MELDUNGEN.grundwertNeuerWert],
};
