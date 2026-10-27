// Die Logik der Übung BinomKopfrechnen.vue: Quadrate und Produkte nahe an glatten Zehnern mit den binomischen Formeln
// im Kopf rechnen (51² = (50 + 1)², 49² = (50 − 1)², 21 · 19 = (20 + 1)(20 − 1) = 20² − 1²). Gefragt sind die Formel,
// die hilft, und das Ergebnis. Dazu das Flächenbild mit Zahlen. Reine Funktionen; aus geschickt-rechnen.js der alten
// Lern-App.
import { quadratMinus, raster, umlegen, type Zeichnung } from "./BinomFlaeche.ts";
import { erzeugeZufall, leseGanzzahl, schrittMarkdown, zuLatex, type Schritt } from "./BinomTerm.ts";

export { schrittText } from "./BinomTerm.ts";

export interface KopfAufgabe {
  formel: 1 | 2 | 3;
  basis: number;
  abstand: number;
  /** Was zu rechnen ist: "49²" oder "21 · 19". */
  rechnung: string;
  /** Die Rechnung als Binom: "(50 − 1)²". */
  formelText: string;
  ergebnis: number;
  schritte: Schritt[];
  tipp: string;
}

export interface KopfAntwort {
  /** Die gewählte Formel: "1", "2", "3" oder "" (keine gewählt). */
  formel: string;
  ergebnis: string;
}

const BASEN = [20, 30, 40, 50, 60, 70, 80, 90, 100];
// Neutrale Leitfragen: kein Tipp nennt die Zerlegung oder die Formel, das zeigt erst der Rechenweg.
const TIPPS = {
  1: "Liegt die Zahl knapp über einer glatten Zahl?",
  2: "Liegt die Zahl knapp unter einer glatten Zahl?",
  3: "Liegen beide Zahlen gleich weit neben einer glatten Zahl?",
};
/** Die Formeln zur Auswahl. */
export const FORMELN = [
  { wert: "1", text: "1. Formel: (a + b)²" },
  { wert: "2", text: "2. Formel: (a − b)²" },
  { wert: "3", text: "3. Formel: (a + b)(a − b)" },
];

function schritte(
  formel: 1 | 2 | 3,
  B: number,
  A: number,
  rechnung: string,
  formelText: string,
  ergebnis: number,
): Schritt[] {
  if (formel === 3) {
    return [
      ["", `${rechnung} = ${formelText}`, " → 3. Formel"],
      ["", `= ${B}² − ${A}² = ${B * B} − ${A * A}`],
      ["", `= ${ergebnis}`],
    ];
  }
  const op = formel === 1 ? "+" : "−";
  return [
    [
      "",
      `${formel === 1 ? B + A : B - A} = ${B} ${op} ${A}`,
      ", also ",
      `${rechnung} = ${formelText}`,
      ` → ${formel}. Formel`,
    ],
    ["", `= ${B}² ${op} 2 · ${B} · ${A} + ${A}² = ${B * B} ${op} ${2 * A * B} + ${A * A}`],
    ["", `= ${ergebnis}`],
  ];
}

/** Die Aufgabe: aus dem Zufall der Aufgabennummer, oder mit festen Werten für das Bild zum Beispiel. */
export function erzeugeKopfAufgabe(
  seed: number,
  fest: { formel?: number; basis?: number; abstand?: number } = {},
): KopfAufgabe {
  const z = erzeugeZufall(seed);
  const gewaehlt = fest.formel ?? z.wahl([1, 2, 3]);
  const formel: 1 | 2 | 3 = gewaehlt === 1 || gewaehlt === 2 ? gewaehlt : 3;
  const B = fest.basis ?? z.wahl(BASEN);
  const A = fest.abstand ?? z.ganzzahl(1, 3);
  const rechnung = formel === 1 ? `${B + A}²` : formel === 2 ? `${B - A}²` : `${B + A} · ${B - A}`;
  const formelText = formel === 1 ? `(${B} + ${A})²` : formel === 2 ? `(${B} − ${A})²` : `(${B} + ${A})(${B} − ${A})`;
  const ergebnis = formel === 1 ? (B + A) ** 2 : formel === 2 ? (B - A) ** 2 : (B + A) * (B - A);
  return {
    formel,
    basis: B,
    abstand: A,
    rechnung,
    formelText,
    ergebnis,
    schritte: schritte(formel, B, A, rechnung, formelText, ergebnis),
    tipp: TIPPS[formel],
  };
}

export const generate = (seed: number, _props: unknown): KopfAufgabe => erzeugeKopfAufgabe(seed);

export function check(aufgabe: KopfAufgabe, antwort: KopfAntwort): boolean {
  return antwort.formel === String(aufgabe.formel) && leseGanzzahl(antwort.ergebnis) === aufgabe.ergebnis;
}

const MELDUNG_FORMEL = {
  1: "Die Zahl liegt knapp über einer glatten Zahl – Plus: die 1. Formel (a + b)².",
  2: "Die Zahl liegt knapp unter einer glatten Zahl – Minus: die 2. Formel (a − b)².",
  3: "Zwei verschiedene Zahlen, gleich weit neben einer glatten Zahl – einmal plus, einmal minus: die 3. Formel.",
};

/** Ergebnisse einer falsch angewendeten Formel: Mittelglied fehlt, halb oder mit falschem Vorzeichen; b² mit falschem Vorzeichen. */
export function fehlErgebnisse(aufgabe: KopfAufgabe): number[] {
  const { basis: B, abstand: A } = aufgabe;
  const liste: number[] = [];
  for (const mitte of [2 * A * B, -2 * A * B, A * B, -A * B, 0]) {
    for (const ende of [A * A, -A * A]) liste.push(B * B + mitte + ende);
  }
  return liste.filter((w) => w !== aufgabe.ergebnis);
}

/** Warum die Antwort nicht stimmt; "" bei einer richtigen. */
export function grund(aufgabe: KopfAufgabe, antwort: KopfAntwort): string {
  if (check(aufgabe, antwort)) return "";
  if (antwort.formel === "") return "Wähle die Formel, die hilft.";
  if (antwort.formel !== String(aufgabe.formel)) return MELDUNG_FORMEL[aufgabe.formel];
  const zahl = leseGanzzahl(antwort.ergebnis);
  if (zahl === undefined) return "Die Formel stimmt. Schreib das Ergebnis als ganze Zahl, ohne Punkt, z. B. 2401.";
  if (fehlErgebnisse(aufgabe).includes(zahl)) {
    const glieder = aufgabe.schritte[1]?.[1]?.replace(/^= /, "").split(" = ")[0] ?? "";
    return `Die Formel stimmt, aber sie ist nicht ganz richtig angewendet. Schreib alle Glieder auf: ${glieder}.`;
  }
  return "Das stimmt noch nicht. Zerlege die Zahl in eine glatte Zahl (Zehner oder Hunderter) und einen kleinen Rest.";
}

/** Die Antwort aus Wahl und Feld; undefined, solange weder eine Formel gewählt noch etwas getippt ist. */
export const antwortAus = (formel: string, ergebnis: string): KopfAntwort | undefined =>
  formel === "" && ergebnis.trim() === "" ? undefined : { formel, ergebnis };

/** Die Meldung der App zu einer falschen Antwort (Vertrag der Übung): grund. */
export const reason = (aufgabe: KopfAufgabe, antwort: KopfAntwort, _props?: unknown, _lang?: string): string =>
  grund(aufgabe, antwort);

/**
 * Die Antwort jedes typischen Fehlers aus about.mistakes, mit der richtigen Formel: das Mittelglied vergessen (1. und
 * 2. Formel), b² addiert (3. Formel). Ein falsches Vorzeichen oder ein halbes Mittelglied und eine falsche Formel
 * haben mehrere Antworten.
 */
export function mistakes(aufgabe: KopfAufgabe, _props?: unknown): (KopfAntwort | undefined)[] {
  const { basis: B, abstand: A } = aufgabe;
  const formel = String(aufgabe.formel);
  return [
    aufgabe.formel === 3 ? undefined : wrong(aufgabe),
    undefined,
    aufgabe.formel === 3 ? { formel, ergebnis: String(B * B + A * A) } : undefined,
    undefined,
  ];
}

/** Die Aufgabe, wie das Kind sie liest, mit {Rechnung}. */
export const template = (props: { frage?: string; frageFormel?: string }, _lang?: string): string =>
  `${props.frage ?? "Rechne geschickt im Kopf:"} {Rechnung}. ${props.frageFormel ?? "Welche Formel hilft?"} Zur Wahl: ${FORMELN.map((f) => f.text).join(", ")}. Dazu das Ergebnis als ganze Zahl.`;

/** Was eine Aufgabe festlegt: die Rechnung. */
export const params = (aufgabe: KopfAufgabe, _props?: unknown, _lang?: string): Record<string, string> => ({
  Rechnung: aufgabe.rechnung,
});

/** Eine Antwort als Text: die gewählte Formel und das Ergebnis. */
export function show(antwort: KopfAntwort, _aufgabe?: KopfAufgabe, _props?: unknown, _lang?: string): string {
  const formel = FORMELN.find((f) => f.wert === antwort.formel)?.text.split(":")[0] ?? "keine Formel";
  const ergebnis = antwort.ergebnis.trim() === "" ? "kein Ergebnis" : antwort.ergebnis.trim();
  return `${formel}, ${ergebnis}`;
}

export function solution(aufgabe: KopfAufgabe): KopfAntwort {
  return { formel: String(aufgabe.formel), ergebnis: String(aufgabe.ergebnis) };
}

/** Der häufigste Fehler: das Mittelglied vergessen (49² = 2500 − 1 = 2499). */
export function wrong(aufgabe: KopfAufgabe): KopfAntwort {
  const { basis: B, abstand: A } = aufgabe;
  const ohneMitte = aufgabe.formel === 2 ? B * B - A * A : B * B + A * A;
  return { formel: String(aufgabe.formel), ergebnis: String(ohneMitte) };
}

export function describe(aufgabe: KopfAufgabe, _props: unknown, _lang: string): { task: string; solution: string } {
  const name = FORMELN[aufgabe.formel - 1]?.text ?? "";
  return {
    task: `Rechne geschickt im Kopf: $${zuLatex(aufgabe.rechnung)}$. Welche binomische Formel hilft (1. Formel $(a + b)^2$, 2. Formel $(a - b)^2$ oder 3. Formel $(a + b)(a - b)$), und was kommt heraus?`,
    solution: [
      `Es hilft die ${name.split(":")[0] ?? ""}: $${zuLatex(`${aufgabe.rechnung} = ${aufgabe.formelText} = ${aufgabe.ergebnis}`)}$`,
      ...aufgabe.schritte.map((s) => `- ${schrittMarkdown(s)}`),
    ].join("\n"),
  };
}

export const about = {
  task: "Du rechnest ein Quadrat wie 49² oder ein Produkt wie 21 · 19 im Kopf mit einer binomischen Formel: Du wählst die Formel, die hilft, und gibst das Ergebnis ein.",
  answer:
    "Die Wahl einer der drei Formeln und das Ergebnis als ganze Zahl ohne Tausenderpunkt, ins Feld getippt; dann „Prüfen“ unter der Aufgabe. Nach dem Prüfen zeigt das Flächenbild die Zerlegung, nach einer falschen Antwort gibt es „Lösung zeigen“.",
  correct:
    "Richtig ist die Formel, die zur Zerlegung um die glatte Zahl passt (knapp darüber: 1. Formel, knapp darunter: 2. Formel, zwei Zahlen gleich weit links und rechts: 3. Formel), zusammen mit dem genauen Ergebnis.",
  mistakes: [
    "Das Mittelglied vergessen: 49² = 2500 − 1 = 2499 statt 2401.",
    "Das Mittelglied mit dem falschen Vorzeichen oder nur halb gerechnet.",
    "Bei der dritten Formel b² addiert statt abgezogen: 21 · 19 = 401 statt 399.",
    "Die falsche Formel gewählt, z. B. die 1. Formel für 49².",
  ],
};

/**
 * Das Flächenbild: vor dem Prüfen nur die Aufgabe als neutrale Fläche ("49² = ?"), damit es die Frage nach der Formel
 * nicht vorwegnimmt. Danach Zerlegung und Formelbild, vor der richtigen Antwort mit den Rechnungen ("50 · 1"),
 * danach mit den Werten ("50").
 */
export function kopfBild(aufgabe: KopfAufgabe, stand: "neu" | "geprueft" | "geloest"): Zeichnung {
  const { formel, basis: B, abstand: A } = aufgabe;
  if (stand === "neu") {
    const breite = formel === 2 ? B - A : B + A;
    const hoehe = formel === 1 ? B + A : B - A;
    return raster(
      [{ text: String(breite), laenge: breite }],
      [{ text: String(hoehe), laenge: hoehe }],
      [[{ flaeche: "leer", text: "?" }]],
      `${aufgabe.rechnung} = ?`,
    );
  }
  const geloest = stand === "geloest";
  const wert = (rechnung: string, zahl: number): string => (geloest ? String(zahl) : rechnung);
  const titel = `${aufgabe.rechnung} = ${geloest ? aufgabe.ergebnis : "?"}`;
  const [gross, klein] = [
    { text: String(B), laenge: B },
    { text: String(A), laenge: A },
  ];
  if (formel === 1) {
    return raster(
      [gross, klein],
      [gross, klein],
      [
        [
          { flaeche: "a", text: wert(`${B}²`, B * B) },
          { flaeche: "ab", text: wert(`${B} · ${A}`, A * B) },
        ],
        [
          { flaeche: "ab", text: wert(`${A} · ${B}`, A * B) },
          { flaeche: "b", text: wert(`${A}²`, A * A) },
        ],
      ],
      titel,
      `${B + A}² = (${B} + ${A})²`,
    );
  }
  if (formel === 2) {
    return quadratMinus(
      gross,
      klein,
      { rest: `${B - A}²`, restSeite: String(B - A), streifen: wert(`${B} · ${A}`, A * B), ecke: wert(`${A}²`, A * A) },
      titel,
      `${B}² − zwei Streifen + Ecke zurück`,
    );
  }
  return umlegen(
    gross,
    klein,
    {
      ecke: `− ${wert(`${A}²`, A * A)}`,
      oben: `${B}² ohne die Ecke ${A}²`,
      unten: `umgelegt: ${B + A} · ${B - A}`,
      rest: String(B - A),
    },
    titel,
    `${B + A} · ${B - A} = ${B}² − ${A}²`,
  );
}
