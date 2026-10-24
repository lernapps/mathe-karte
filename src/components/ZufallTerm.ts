// Übung „Produkt, Summe, Potenz“: Aus drei Termen den wählen, der P(E) berechnet. Die falschen bilden typische Fehler
// ab: nur ein Pfad, entlang des Pfades addiert, die Pfade des Gegenereignisses, mit statt ohne Zurücklegen (oder
// umgekehrt). Rein, ohne DOM.
import { type Bruch, text } from "./ZufallBruch.ts";
import {
  type Baum,
  type Versuchsart,
  baueBaum,
  blaetter,
  ereignisPfade,
  ereignisW,
  moeglicheEreignisse,
  ohneMoeglich,
  pfadName,
  pfadTerm,
  urnenSpec,
  versuchText,
  waehleVersuch,
  zufallAus,
  zweigeEntlang,
  zweigText,
} from "./ZufallModell.ts";

export interface Option {
  text: string;
  richtig: boolean;
  fehler: string;
}

export interface TermAufgabe {
  experiment: Versuchsart;
  urne: string;
  zuege: number;
  mit: boolean;
  code: string;
  name: string;
  pfade: string[];
  namen: string[];
  loesung: Bruch;
  optionen: Option[];
  text: string;
}

const summenTerm = (baum: Baum, pfade: readonly string[]) => pfade.map((p) => pfadTerm(baum, p)).join(" + ");

function fehlerTerme(baum: Baum, pfade: readonly string[], code: string): Omit<Option, "richtig">[] {
  const liste: Omit<Option, "richtig">[] = [];
  const erster = pfade[0] ?? "";
  if (pfade.length > 1) {
    liste.push({
      text: pfadTerm(baum, erster),
      fehler: "Nur ein Pfad – die anderen passenden Pfade (z. B. andere Reihenfolge) fehlen.",
    });
  }
  liste.push({
    text: pfade.map((p) => zweigeEntlang(baum, p).map(zweigText).join(" + ")).join(" + "),
    fehler: "Entlang eines Pfades wird multipliziert, nicht addiert.",
  });
  const gegen = blaetter(baum)
    .map((k) => k.id)
    .filter((id) => !pfade.includes(id));
  if (gegen.length >= 1 && gegen.length <= 4) {
    liste.push({ text: summenTerm(baum, gegen), fehler: "Das sind die Pfade des Gegenereignisses." });
  }
  if (ohneMoeglich(baum.versuch)) {
    const anderer = baueBaum(baum.versuch, baum.zuege, !baum.mit);
    liste.push({
      text: summenTerm(
        anderer,
        ereignisPfade(anderer, code).map((k) => k.id),
      ),
      fehler: baum.mit
        ? "Hier wurde ohne Zurücklegen gerechnet, die Aufgabe ist aber mit."
        : "Hier wurde mit Zurücklegen gerechnet – der Nenner muss aber kleiner werden.",
    });
  }
  return liste;
}

export function generate(seed: number, _props?: unknown): TermAufgabe {
  const z = zufallAus(seed);
  const { versuch, mit } = waehleVersuch(z, 2);
  const baum = baueBaum(versuch, 2, mit);
  const passend = moeglicheEreignisse(versuch, 2).filter((e) => {
    const n = ereignisPfade(baum, e.code).length;
    return n >= 2 && n <= 4;
  });
  const e = z.wahl(passend);
  const pfade = ereignisPfade(baum, e.code).map((k) => k.id);
  const richtig: Option = { text: summenTerm(baum, pfade), richtig: true, fehler: "" };
  const falsche: Option[] = [];
  for (const f of z.mischen(fehlerTerme(baum, pfade, e.code))) {
    if (f.text !== richtig.text && !falsche.some((x) => x.text === f.text)) falsche.push({ ...f, richtig: false });
    if (falsche.length === 2) break;
  }
  while (falsche.length < 2) {
    falsche.push({
      text: `${richtig.text} + ${falsche.length + 1}`,
      richtig: false,
      fehler: "Die Summe wäre größer als 1.",
    });
  }
  const optionen = [...falsche];
  optionen.splice(z.ganzzahl(0, 2), 0, richtig);
  return {
    experiment: versuch.art,
    urne: urnenSpec(versuch),
    zuege: 2,
    mit: baum.mit,
    code: e.code,
    name: e.name,
    pfade,
    namen: pfade.map((p) => pfadName(baum, p)),
    loesung: ereignisW(baum, e.code),
    optionen,
    text: `${versuchText(versuch, 2, baum.mit)} Ereignis E: „${e.name}“. Welcher Term berechnet P(E)?`,
  };
}

/** Die Antwort ist die Nummer des gewählten Terms, von 0 an. */
export const check = (task: TermAufgabe, answer: number): boolean => task.optionen[answer]?.richtig === true;
export const solution = (task: TermAufgabe): number => task.optionen.findIndex((o) => o.richtig);
export const wrong = (task: TermAufgabe): number => task.optionen.findIndex((o) => !o.richtig);

export const TIPP =
  "Zähle zuerst die Pfade, die zum Ereignis passen. Jeder Pfad ist ein Produkt, die Pfade werden addiert.";

/** Warum die gewählte Option falsch ist. */
export function grund(task: TermAufgabe, answer: number): string {
  const o = task.optionen[answer];
  if (o === undefined) return "Wähl einen Term aus.";
  return o.richtig ? "" : `${o.fehler} ${TIPP}`;
}

export const BUCHSTABEN = ["A", "B", "C"];

export const weg = (task: TermAufgabe): string[] => [
  `Passende Pfade: ${task.namen.join(", ")}`,
  `P(E) = ${task.optionen.find((o) => o.richtig)?.text ?? ""} = ${text(task.loesung)}`,
];

export function describe(task: TermAufgabe, _props?: unknown, _lang?: string): { task: string; solution: string } {
  const liste = task.optionen.map((o, i) => `- ${BUCHSTABEN[i] ?? ""}) ${o.text}`).join("\n");
  const richtig = BUCHSTABEN[solution(task)] ?? "";
  return {
    task: `${task.text}\n\nDas Bild zeigt den Baum der Aufgabe mit allen Zweigen.\n\n${liste}`,
    solution: [`Richtig ist ${richtig}).`, ...weg(task)].join("\n\n"),
  };
}

export const about = {
  task: "Aus drei Termen den wählen, der P(E) für ein Ereignis im Baumdiagramm (zwei Züge) berechnet: Produkte entlang der Pfade, Summe über die Pfade.",
  answer: "Einer von drei Termen (A, B oder C).",
  correct:
    "Der Term, der für jeden passenden Pfad das Produkt seiner Zweige bildet und die Produkte aller passenden Pfade addiert.",
  mistakes: [
    "Nur ein Pfad statt aller passenden.",
    "Entlang des Pfades addiert statt multipliziert.",
    "Die Pfade des Gegenereignisses.",
    "Mit statt ohne Zurücklegen gerechnet (oder umgekehrt).",
  ],
};
