// Übung „Prozentwert berechnen“: W = G · p / 100, in fünf Kontexten (Fahrrad, Klasse, Umfrage, Akku, Basketball), mit
// Hunderterfeld. Portiert aus aufgaben/prozentwert.js der alten App.
import {
  type Antworten,
  type Aufgabe,
  type KontextId,
  RABATTE,
  beschreibe,
  bildWert,
  check,
  eingabeFuer,
  erzeugeTripel,
  grundFuer,
  imDativ,
  solution,
  waehleKontext,
  zahlenfeld,
} from "./ProzentAufgabe.ts";
import {
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
  zahl,
} from "./ProzentKern.ts";

export { check, solution };

const TEXTE: Readonly<Record<KontextId, (g: string, p: string) => string>> = {
  preis: (g, p) => `Ein Fahrrad kostet ${g}. Im Angebot gibt es ${p} Rabatt. Wie viel Euro sparst du?`,
  klasse: (g, p) =>
    `In einer Klasse sind ${g}. ${p} von ihnen fahren mit dem Rad zur Schule. Wie viele Schüler sind das?`,
  umfrage: (g, p) =>
    `Bei einer Umfrage wurden ${g} befragt. ${p} davon lesen täglich Nachrichten. Wie viele Personen sind das?`,
  akku: (g, p) =>
    `Ein Handy-Akku fasst ${g} (Milliamperestunden: so viel Ladung speichert der Akku). Er ist noch zu ${p} geladen. Wie viel mAh sind noch drin?`,
  sport: (g, p) => `Beim Basketball wirft Lina ${g} auf den Korb. ${p} davon treffen. Wie viele Treffer sind das?`,
};

export interface ProzentwertAufgabe extends Aufgabe {
  grundwert: number;
  prozentsatz: number;
}

export function generate(seed: number): ProzentwertAufgabe {
  const zufall = erzeugeZufall(seed, "prozentwert");
  const kontext = waehleKontext(zufall, undefined, { preis: { min: 150, max: 1500, saetze: RABATTE } });
  const { grundwert, prozentsatz, prozentwert } = erzeugeTripel(zufall, kontext);
  const einheit = kontext.einheit;
  // gefragt sind Treffer, nicht Würfe: die Antwort hat die Einheit des Gesuchten
  const wEinheit = kontext.id === "sport" ? "Treffer" : einheit;
  const exakt = durch(mal(alsBruch(grundwert), alsBruch(prozentsatz)), bruch(100));
  const ergebnis = mitEinheit(prozentwert, wEinheit);
  const titel = `${formatZahl(prozentsatz)} % von ${bildWert(grundwert, imDativ(einheit))}`;
  return {
    grundwert,
    prozentsatz,
    text: TEXTE[kontext.id](mitEinheit(grundwert, einheit), mitEinheit(prozentsatz, "%")),
    felder: [zahlenfeld("prozentwert", "Prozentwert W", wEinheit, artFuer(einheit), exakt)],
    bild: { art: "raster", gefuellt: prozentsatz, titel, untertitel: "100 Kästchen = Grundwert" },
    bildGeloest: { art: "raster", gefuellt: prozentsatz, titel, untertitel: `= ${bildWert(prozentwert, wEinheit)}` },
    tipp: `Der Grundwert ist das Ganze: ${mitEinheit(grundwert, einheit)} sind 100 %. Rechne erst 1 % aus (Grundwert geteilt durch 100) und dann mal ${formatZahl(prozentsatz)}.`,
    rechenweg: [
      "W = G · p / 100",
      `W = ${formatWert(grundwert, einheit)} · ${formatZahl(prozentsatz)} / 100`,
      `W ${gleichheitszeichen(zahl(exakt), prozentwert)} ${ergebnis}`,
    ],
    richtig: `Ergebnis: ${ergebnis}.`,
  };
}

export const MELDUNGEN = {
  prozentStattDezimal: "Du hast vergessen, durch 100 zu teilen: 12 % sind 12/100 = 0,12.",
  restStattAnteil: "Du hast den Rest ausgerechnet, nicht den Anteil. Gefragt ist der Prozentwert selbst.",
  falsch: "Das stimmt noch nicht. Rechne noch einmal: erst 1 %, dann den Prozentsatz mal nehmen.",
};

/** Was an einer falschen Antwort falsch ist. */
export function grund(aufgabe: ProzentwertAufgabe, antwort: unknown): string {
  const [feld] = aufgabe.felder;
  if (feld?.typ !== "zahl") return MELDUNGEN.falsch;
  return grundFuer(
    aufgabe,
    antwort,
    (antworten: Antworten) => {
      const eingabe = antworten["prozentwert"];
      if (passtZu(eingabe, mal(feld.exakt, bruch(100)), feld.art)) {
        const p = aufgabe.prozentsatz;
        return `Du hast vergessen, durch 100 zu teilen: ${formatZahl(p)} % sind ${formatZahl(p)}/100 = ${formatGenau(p / 100)}.`;
      }
      if (passtZu(eingabe, minus(alsBruch(aufgabe.grundwert), feld.exakt), feld.art)) return MELDUNGEN.restStattAnteil;
      return undefined;
    },
    MELDUNGEN.falsch,
  );
}

/** Die typische falsche Antwort: nicht durch 100 geteilt. */
export function wrong(aufgabe: ProzentwertAufgabe): Antworten {
  const [feld] = aufgabe.felder;
  return { prozentwert: feld?.typ === "zahl" ? eingabeFuer(zahl(feld.exakt) * 100) : "0" };
}

export function describe(aufgabe: ProzentwertAufgabe): { task: string; solution: string } {
  return beschreibe(aufgabe);
}

export const about = {
  task: "Eine Textaufgabe: Grundwert und Prozentsatz sind gegeben, der Prozentwert ist gesucht. Das Bild zur Aufgabe ist ein Hunderterfeld, in dem der Prozentsatz blau ist.",
  answer:
    "Eine Zahl in der Einheit des Grundwerts (Euro, Schüler, Personen, mAh, Treffer). Komma oder Punkt, ein Bruch oder ein Term wie 250*12/100 gehen auch.",
  correct:
    "Richtig ist der Prozentwert W = G · p / 100: exakt, oder kaufmännisch gerundet auf die Stellen, die neben dem Feld stehen (Euro auf Cent).",
  mistakes: [MELDUNGEN.prozentStattDezimal, MELDUNGEN.restStattAnteil],
};
