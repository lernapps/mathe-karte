// Übung „Sachaufgaben übersetzen“: Typ Gleichung (die passende Gleichung wählen und ausrechnen) und Typ Dreisatz
// (100 % → 1 % → p %), mit Hunderterfeld. Portiert aus aufgaben/sachaufgaben.js der alten App.
import {
  type Antworten,
  type Aufgabe,
  type Bild,
  type Feld,
  type KontextId,
  PROZENTSAETZE,
  RABATTE,
  beschreibe,
  bildWert,
  check,
  eingabeFuer,
  erzeugeTripel,
  grundFuer,
  imDativ,
  solution,
  urteil,
  waehleKontext,
  zahlenfeld,
} from "./ProzentAufgabe.ts";
import {
  type Zufall,
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
  mitEinheit,
  runde,
  zahl,
} from "./ProzentKern.ts";

export { check, solution };

type Gesucht = "W" | "G" | "p";
type Texte = Record<Gesucht, (g: string, w: string, p: string) => string>;
const TEXTE: Partial<Record<KontextId, Texte>> = {
  preis: {
    W: (g, _w, p) => `Ein Skateboard kostet ${g}. Es gibt ${p} Rabatt. Wie viel Euro Rabatt sind das?`,
    p: (g, w) => `Ein Skateboard kostet ${g}. Der Rabatt beträgt ${w}. Wie viel Prozent sind das?`,
    G: (_g, w, p) =>
      `Beim Kauf eines Skateboards sparst du ${w}. Das sind ${p} Rabatt. Wie viel hat es vorher gekostet?`,
  },
  umfrage: {
    W: (g, _w, p) => `${g} wurden befragt. ${p} davon treiben regelmäßig Sport. Wie viele Personen sind das?`,
    p: (g, w) => `${g} wurden befragt. ${w} davon treiben regelmäßig Sport. Wie viel Prozent sind das?`,
    G: (_g, w, p) => `${w} treiben regelmäßig Sport. Das sind ${p} aller Befragten. Wie viele Personen wurden befragt?`,
  },
};

/** Die richtige Gleichung und zwei Fallen (Formeln verwechselt) für das Gesuchte. */
function gleichungen(gesucht: Gesucht, G: string, W: string, P: string): { richtig: string; falsch: string[] } {
  if (gesucht === "W")
    return { richtig: `W = ${G} · ${P} / 100`, falsch: [`W = ${G} · 100 / ${P}`, `W = ${P} / ${G} · 100`] };
  if (gesucht === "G")
    return { richtig: `G = ${W} · 100 / ${P}`, falsch: [`G = ${W} · ${P} / 100`, `G = ${P} / ${W} · 100`] };
  return { richtig: `p = ${W} / ${G} · 100`, falsch: [`p = ${G} / ${W} · 100`, `p = ${G} · ${W} / 100`] };
}

export interface SachAufgabe extends Aufgabe {
  typ: "gleichung" | "dreisatz";
}

/** Das Hunderterfeld: das Gesuchte steht bis zur Lösung als „?“ darin, die Füllung verrät p nicht. */
function bilder(gesucht: Gesucht, g: number, w: number, p: number, einheit: string, wEinheit: string): [Bild, Bild] {
  const P = `${formatZahl(p)} %`;
  const G = bildWert(g, einheit);
  const W = bildWert(w, wEinheit);
  if (gesucht === "G") {
    const bild = (geloest: boolean): Bild => ({
      art: "raster",
      gefuellt: p,
      titel: `${P} = ${W}`,
      untertitel: `100 % = ${geloest ? G : "?"}`,
    });
    return [bild(false), bild(true)];
  }
  if (gesucht === "p") {
    const bild = (geloest: boolean): Bild => ({
      art: "raster",
      gefuellt: geloest ? p : 0,
      titel: `100 % = ${G}`,
      untertitel: `${W} = ${geloest ? P : "? %"}`,
    });
    return [bild(false), bild(true)];
  }
  const eins = g / 100;
  const einsText = runde(eins, 2) === eins ? bildWert(eins, einheit) : `${formatGenau(eins)} ${einheit}`.trim();
  const titel = `${P} von ${bildWert(g, imDativ(einheit))}`;
  return [
    { art: "raster", gefuellt: p, titel, untertitel: `ein Kästchen = 1 %, ${P} = ?` },
    { art: "raster", gefuellt: p, titel, untertitel: `1 % = ${einsText}, ${P} = ${bildWert(w, einheit)}` },
  ];
}

function aufgabeGleichung(zufall: Zufall): SachAufgabe {
  const kontext = waehleKontext(zufall, ["preis", "umfrage"], { preis: { min: 30, max: 300, saetze: RABATTE } });
  const { grundwert: g, prozentsatz: p, prozentwert: w } = erzeugeTripel(zufall, kontext);
  const gesucht = zufall.wahl<Gesucht>(["W", "G", "p"]);
  const einheit = kontext.einheit;
  const wEinheit = kontext.id === "umfrage" ? "Personen" : einheit;
  const texte = TEXTE[kontext.id] as Texte;
  const gl = gleichungen(gesucht, formatWert(g, einheit), formatWert(w, einheit), formatZahl(p));
  const optionen = zufall.mischen([gl.richtig, ...gl.falsch]).map((t) => ({ wert: t, text: t }));
  const [G, W, P, hundert] = [alsBruch(g), alsBruch(w), alsBruch(p), bruch(100)];
  const exakt = { W: durch(mal(G, P), hundert), G: durch(mal(W, hundert), P), p: mal(durch(W, G), hundert) }[gesucht];
  const ergebnisEinheit = gesucht === "p" ? "%" : einheit;
  const ergebnis = mitEinheit({ W: w, G: g, p }[gesucht], ergebnisEinheit);
  const [bild, bildGeloest] = bilder(gesucht, g, w, p, einheit, wEinheit);
  const was = { G: "das Ganze (Grundwert)", W: "der Teil (Prozentwert)", p: "der Anteil in Prozent (Prozentsatz)" }[
    gesucht
  ];
  return {
    typ: "gleichung",
    text: texte[gesucht](mitEinheit(g, einheit), mitEinheit(w, wEinheit), mitEinheit(p, "%")),
    felder: [
      { typ: "knoepfe", id: "gleichung", label: "Welche Gleichung passt?", optionen, loesung: gl.richtig },
      zahlenfeld(
        "ergebnis",
        `Ergebnis (${gesucht})`,
        ergebnisEinheit,
        gesucht === "p" ? "prozent" : artFuer(einheit),
        exakt,
      ),
    ],
    bild,
    bildGeloest,
    tipp: `Gesucht ist ${was}. Schreibe zuerst auf, was G, W und p sind, dann passt nur eine Gleichung.`,
    rechenweg: [`Gesucht: ${gesucht}`, `Gleichung: ${gl.richtig}`, `Ergebnis: ${ergebnis}`],
    richtig: `Ergebnis: ${ergebnis}.`,
  };
}

function aufgabeDreisatz(zufall: Zufall): SachAufgabe {
  const kontext = waehleKontext(zufall, ["preis", "umfrage", "akku"], { preis: { min: 300, max: 1500 } });
  const g = 100 * zufall.ganzzahl(Math.max(1, Math.ceil(kontext.min / 100)), Math.floor(kontext.max / 100));
  const p = zufall.wahl(PROZENTSAETZE);
  const einheit = kontext.einheit;
  const einsExakt = durch(alsBruch(g), bruch(100));
  const prozentExakt = mal(einsExakt, alsBruch(p));
  const w = runde((g * p) / 100, 2);
  const eins = zahl(einsExakt);
  const einsText = runde(eins, 2) === eins ? formatWert(eins, einheit) : formatGenau(eins);
  const ding = { preis: "Ein Laptop kostet", umfrage: "Befragt wurden", akku: "Der Akku fasst" }[kontext.id as "preis"];
  // Zählbares heißt „wie viele“
  const frage = { preis: "wie viel Euro", umfrage: "wie viele Personen", akku: "wie viel mAh" }[kontext.id as "preis"];
  const mah = kontext.id === "akku" ? " (Milliamperestunden: so viel Ladung speichert der Akku)" : "";
  const P = `${formatZahl(p)} %`;
  const felder: Feld[] = [
    zahlenfeld("eins", "1 % sind", einheit, "zahl", einsExakt),
    zahlenfeld("prozent", `${P} sind`, einheit, "zahl", prozentExakt),
  ];
  const [bild, bildGeloest] = bilder("W", g, w, p, einheit, einheit);
  return {
    typ: "dreisatz",
    text: `${ding} ${mitEinheit(g, einheit)}${mah}. Rechne mit dem Dreisatz aus, ${frage} ${P} davon sind: 100 % sind ${mitEinheit(g, einheit)}.`,
    felder,
    bild,
    bildGeloest,
    tipp: "Von 100 % auf 1 %: durch 100 teilen. Von 1 % auf p %: mal p nehmen.",
    // 1 % steht ungerundet (Geld mit Cent wie 2,50 €): mit genau dieser Zahl geht die nächste Zeile weiter
    rechenweg: [
      `100 % = ${mitEinheit(g, einheit)}`,
      `1 % = ${formatWert(g, einheit)} : 100 = ${einsText} ${einheit}`,
      `${P} = ${einsText} · ${formatZahl(p)} ${gleichheitszeichen(zahl(prozentExakt), w)} ${mitEinheit(w, einheit)}`,
    ],
    richtig: `Ergebnis: ${P} sind ${mitEinheit(w, einheit)}.`,
  };
}

/** Gleichung oder Dreisatz, je nach Aufgabennummer. */
export function generate(seed: number): SachAufgabe {
  const zufall = erzeugeZufall(seed, "sachaufgaben");
  return zufall.wahl(["gleichung", "dreisatz"]) === "gleichung" ? aufgabeGleichung(zufall) : aufgabeDreisatz(zufall);
}

export const MELDUNGEN = {
  gleichungFalsch: "Die Gleichung passt nicht. Überlege: Ist das Gesuchte das Ganze, der Teil oder der Prozentsatz?",
  ergebnisFalsch: "Die Gleichung stimmt, aber das Ergebnis noch nicht. Rechne noch einmal nach.",
  falsch: "Das stimmt noch nicht. Prüfe jede Zeile: durch 100 teilen, dann mal p nehmen.",
};

/** Was an einer falschen Antwort falsch ist. */
export function grund(aufgabe: SachAufgabe, antwort: unknown): string {
  return grundFuer(
    aufgabe,
    antwort,
    (antworten: Antworten) => {
      if (aufgabe.typ === "dreisatz") return undefined;
      const [gleichung] = aufgabe.felder;
      if (gleichung === undefined) return undefined;
      return urteil(gleichung, antworten["gleichung"]).status === "richtig"
        ? MELDUNGEN.ergebnisFalsch
        : MELDUNGEN.gleichungFalsch;
    },
    MELDUNGEN.falsch,
  );
}

/** Die typische falsche Antwort: eine verwechselte Formel; im Dreisatz mal 100 statt durch 100. */
export function wrong(aufgabe: SachAufgabe): Antworten {
  const richtig = solution(aufgabe);
  const [erstes] = aufgabe.felder;
  if (aufgabe.typ === "gleichung" && erstes?.typ === "knoepfe") {
    const falsch = erstes.optionen.find((o) => o.wert !== erstes.loesung)?.wert ?? "";
    return { ...richtig, gleichung: falsch };
  }
  // 1 % ist der Grundwert mal 100 statt geteilt durch 100
  const eins = aufgabe.felder.find((feld) => feld.id === "eins");
  return { ...richtig, eins: eins?.typ === "zahl" ? eingabeFuer(zahl(eins.exakt) * 10000) : "0" };
}

export function describe(aufgabe: SachAufgabe): { task: string; solution: string } {
  return beschreibe(aufgabe);
}

export const about = {
  task: "Eine Sachaufgabe zur Prozentrechnung, Aufgabe für Aufgabe einer von zwei Typen: Gleichung (aus drei Gleichungen die passende wählen und das Ergebnis ausrechnen) oder Dreisatz (zum Grundwert erst 1 %, dann p % ausrechnen). Das Bild zur Aufgabe ist ein Hunderterfeld.",
  answer:
    "Gleichung: eine der drei Gleichungen und eine Zahl. Dreisatz: zwei Zahlen (1 % und p %) in der Einheit des Grundwerts. Komma oder Punkt, ein Bruch oder ein Term gehen auch.",
  correct:
    "Richtig, wenn jede Angabe stimmt: die Gleichung, deren linke Seite das Gesuchte ist, und das exakte oder richtig gerundete Ergebnis; im Dreisatz 1 % = G / 100 und p % = G / 100 · p.",
  mistakes: [MELDUNGEN.gleichungFalsch, MELDUNGEN.ergebnisFalsch, MELDUNGEN.falsch],
};
