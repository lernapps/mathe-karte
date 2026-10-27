// Übung „Grundwert berechnen“: G = W · 100 / p, in fünf Kontexten (Roller, Klasse, Umfrage, Akku, Basketball), mit
// Hunderterfeld, das das Ganze erst nach der Lösung nennt. Portiert aus aufgaben/grundwert.js der alten App.
import {
  type Antworten,
  type Aufgabe,
  type KontextId,
  KONTEXTE,
  RABATTE,
  beschreibe,
  bildWert,
  check,
  eingabeFuer,
  erzeugeTripel,
  eingabeVon,
  grundFuer,
  nurFalsche,
  platzhalter,
  solution,
  tabellenWert,
  vorlage,
  waehleKontext,
  zahlenfeld,
  zeige,
} from "./ProzentAufgabe.ts";
import {
  alsBruch,
  artFuer,
  bruch,
  durch,
  erzeugeZufall,
  formatWert,
  formatZahl,
  gleichheitszeichen,
  mal,
  mitEinheit,
  passtZu,
  zahl,
} from "./ProzentKern.ts";

export { check, solution };

const TEXTE: Readonly<Record<KontextId, (w: string, p: string) => string>> = {
  preis: (w, p) =>
    `Beim Kauf eines Rollers sparst du ${w}. Das sind ${p} Rabatt. Wie viel hat der Roller vorher gekostet?`,
  klasse: (w, p) =>
    `${w} einer Klasse spielen ein Instrument. Das sind ${p} der Klasse. Wie viele Schüler hat die Klasse?`,
  umfrage: (w, p) =>
    `${w} haben bei einer Umfrage mit „Ja“ gestimmt. Das sind ${p} aller Befragten. Wie viele Personen wurden befragt?`,
  akku: (w, p) =>
    `Im Akku sind noch ${w} (Milliamperestunden: so viel Ladung ist gespeichert). Das sind ${p} der vollen Ladung. Wie viel mAh fasst der Akku voll?`,
  sport: (w, p) => `Mia hat ${w} erzielt. Das sind ${p} ihrer Würfe. Wie oft hat sie geworfen?`,
};
const W_EINHEIT: Partial<Record<KontextId, string>> = { klasse: "Schüler", sport: "Treffer" };

export interface GrundwertAufgabe extends Aufgabe {
  kontext: KontextId;
  prozentsatz: number;
  prozentwert: number;
}

export function generate(seed: number): GrundwertAufgabe {
  const zufall = erzeugeZufall(seed, "grundwert");
  const kontext = waehleKontext(zufall, undefined, { preis: { min: 50, max: 500, saetze: RABATTE } });
  const { grundwert, prozentsatz, prozentwert } = erzeugeTripel(zufall, kontext);
  const einheit = kontext.einheit;
  const wEinheit = W_EINHEIT[kontext.id] ?? einheit;
  const exakt = durch(mal(alsBruch(prozentwert), bruch(100)), alsBruch(prozentsatz));
  const titel = `${formatZahl(prozentsatz)} % = ${bildWert(prozentwert, wEinheit)}`;
  const ergebnis = mitEinheit(grundwert, einheit);
  return {
    kontext: kontext.id,
    prozentsatz,
    prozentwert,
    text: TEXTE[kontext.id](mitEinheit(prozentwert, wEinheit), mitEinheit(prozentsatz, "%")),
    felder: [zahlenfeld("grundwert", "Grundwert G", einheit, artFuer(einheit), exakt)],
    bild: { art: "raster", gefuellt: prozentsatz, titel, untertitel: "100 % = ?" },
    bildGeloest: { art: "raster", gefuellt: prozentsatz, titel, untertitel: `100 % = ${bildWert(grundwert, einheit)}` },
    tipp: `Gesucht ist das Ganze (100 %). Du kennst ${formatZahl(prozentsatz)} %: das sind ${mitEinheit(prozentwert, wEinheit)}. Rechne erst aus, was 1 % ist (durch ${formatZahl(prozentsatz)} teilen), dann mal 100.`,
    rechenweg: [
      "G = W · 100 / p",
      `G = ${formatWert(prozentwert, einheit)} · 100 / ${formatZahl(prozentsatz)}`,
      `G ${gleichheitszeichen(zahl(exakt), grundwert)} ${ergebnis}`,
    ],
    richtig: `Ergebnis: ${ergebnis}.`,
  };
}

export const MELDUNGEN = {
  prozentwertStattGrundwert:
    "Du hast p % vom Prozentwert berechnet. Gesucht ist aber das Ganze, von dem der Prozentwert ein Teil ist.",
  nurEinProzent: "Das ist erst 1 %. Jetzt noch mal 100 nehmen, dann hast du das Ganze.",
  falsch: "Das stimmt noch nicht. Der Grundwert muss größer sein als der Prozentwert (bei p < 100 %).",
};

/** Was an einer falschen Antwort falsch ist. */
export function grund(aufgabe: GrundwertAufgabe, antwort: unknown): string {
  const [feld] = aufgabe.felder;
  if (feld?.typ !== "zahl") return MELDUNGEN.falsch;
  return grundFuer(
    aufgabe,
    antwort,
    (antworten: Antworten) => {
      const eingabe = antworten["grundwert"];
      const vomTeil = durch(mal(alsBruch(aufgabe.prozentwert), alsBruch(aufgabe.prozentsatz)), bruch(100));
      if (passtZu(eingabe, vomTeil, feld.art)) return MELDUNGEN.prozentwertStattGrundwert;
      if (passtZu(eingabe, durch(feld.exakt, bruch(100)), feld.art)) return MELDUNGEN.nurEinProzent;
      return undefined;
    },
    MELDUNGEN.falsch,
  );
}

/** Die Meldung der App zu einer falschen Antwort (Vertrag der Übung): grund. */
export const reason = (aufgabe: GrundwertAufgabe, antwort: unknown, _props?: unknown, _lang?: string): string =>
  grund(aufgabe, antwort);

/** Die Antwort jedes typischen Fehlers aus about.mistakes: p % vom Prozentwert, erst 1 %. */
export function mistakes(aufgabe: GrundwertAufgabe, _props?: unknown): (Antworten | undefined)[] {
  const [feld] = aufgabe.felder;
  if (feld?.typ !== "zahl") return [undefined, undefined];
  const vomTeil = durch(mal(alsBruch(aufgabe.prozentwert), alsBruch(aufgabe.prozentsatz)), bruch(100));
  return nurFalsche(aufgabe, [
    eingabeVon(aufgabe, "grundwert", vomTeil),
    eingabeVon(aufgabe, "grundwert", durch(feld.exakt, bruch(100))),
  ]);
}

/** Die Fassungen des Textes, je Kontext, mit {W} und {p}. */
export const fassungen = (): Record<string, string> =>
  Object.fromEntries(
    KONTEXTE.map((k) => [k.id, TEXTE[k.id](platzhalter("W", W_EINHEIT[k.id] ?? k.einheit), platzhalter("p", "%"))]),
  );

/** Die Aufgabe, wie das Kind sie liest, mit {Fassung}, {W} und {p}. */
export const template = (_props?: unknown, _lang?: string): string =>
  vorlage(fassungen(), "Gesucht ist der Grundwert G (das Ganze).");

/** Was eine Aufgabe festlegt: die Fassung des Textes, der Prozentwert und der Prozentsatz. */
export function params(aufgabe: GrundwertAufgabe, _props?: unknown, _lang?: string): Record<string, string> {
  const einheit = KONTEXTE.find((k) => k.id === aufgabe.kontext)?.einheit ?? "";
  return {
    Fassung: aufgabe.kontext,
    W: tabellenWert(aufgabe.prozentwert, W_EINHEIT[aufgabe.kontext] ?? einheit),
    p: tabellenWert(aufgabe.prozentsatz, "%"),
  };
}

/** Eine Antwort als Text, wie das Kind sie beschreibt. */
export const show = (antwort: unknown, aufgabe: GrundwertAufgabe, _props?: unknown, _lang?: string): string =>
  zeige(aufgabe, antwort);

/** Die typische falsche Antwort: erst 1 %, nicht mal 100 genommen. */
export function wrong(aufgabe: GrundwertAufgabe): Antworten {
  const [feld] = aufgabe.felder;
  return { grundwert: feld?.typ === "zahl" ? eingabeFuer(zahl(feld.exakt) / 100) : "0" };
}

export function describe(aufgabe: GrundwertAufgabe): { task: string; solution: string } {
  return beschreibe(aufgabe);
}

export const about = {
  task: "Eine Textaufgabe: Prozentwert und Prozentsatz sind gegeben, der Grundwert (das Ganze) ist gesucht. Das Bild zur Aufgabe ist ein Hunderterfeld mit dem bekannten Teil in Blau.",
  answer:
    "Eine Zahl in der Einheit des Ganzen (Euro, Schüler, Personen, mAh, Würfe), ins Feld getippt, dann „Prüfen“ unter der Aufgabe; Komma oder Punkt, ein Bruch oder ein Term gehen auch.",
  correct: "Richtig ist G = W · 100 / p: exakt, oder kaufmännisch gerundet auf die Stellen, die neben dem Feld stehen.",
  mistakes: [MELDUNGEN.prozentwertStattGrundwert, MELDUNGEN.nurEinProzent],
};
