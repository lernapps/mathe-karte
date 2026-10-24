// Übung zur 1. Pfadregel: die Wahrscheinlichkeit eines Pfades im Baum, das Produkt seiner Zweige. Typischer Fehler:
// entlang des Pfades addiert. Rein, ohne DOM.
import { type Bruch, meldung, plus, stimmt, text, trifft, urteil } from "./ZufallBruch.ts";
import {
  type Versuchsart,
  baueBaum,
  blaetter,
  ereignisName,
  pfadTerm,
  urnenSpec,
  versuchText,
  waehleVersuch,
  zufallAus,
  zweigeEntlang,
  zweigText,
} from "./ZufallModell.ts";

export interface PfadAufgabe {
  experiment: Versuchsart;
  urne: string;
  zuege: number;
  mit: boolean;
  pfad: string;
  text: string;
  label: string;
  zweige: string[];
  term: string;
  loesung: Bruch;
  summe: Bruch;
  namen: string[];
}

export function generate(seed: number, _props?: unknown): PfadAufgabe {
  const z = zufallAus(seed);
  const { versuch, zuege, mit } = waehleVersuch(z);
  const baum = baueBaum(versuch, zuege, mit);
  const blatt = z.wahl(blaetter(baum));
  const zweige = zweigeEntlang(baum, blatt.id);
  const namen = zweige.map((k) => k.name);
  const label = `P(${namen.join(", ")}) =`;
  return {
    experiment: versuch.art,
    urne: urnenSpec(versuch),
    zuege,
    mit: baum.mit,
    pfad: blatt.id,
    text: `${versuchText(versuch, zuege, baum.mit)} Wie groß ist P(${namen.join(", ")})? Also: ${ereignisName(versuch, zuege, blatt.id) ?? ""}.`,
    label,
    zweige: zweige.map((k) => `P(${k.name}) = ${zweigText(k)}`),
    term: pfadTerm(baum, blatt.id),
    loesung: blatt.pw,
    summe: zweige.reduce((s, k) => plus(s, k.w), { z: 0, n: 1 }),
    namen,
  };
}

export const check = (task: PfadAufgabe, answer: string): boolean => stimmt(answer, task.loesung);
export const solution = (task: PfadAufgabe): string => text(task.loesung);
export const wrong = (task: PfadAufgabe): string => text(task.summe);

export const TIPP =
  "Folge dem Pfad vom Start bis zum Ende und multipliziere die Wahrscheinlichkeiten der Zweige. Du darfst das Produkt so stehen lassen.";
export const ADDIERT = "Du hast addiert. Entlang eines Pfades wird multipliziert (1. Pfadregel).";

/** Warum eine Antwort falsch ist. */
export function grund(task: PfadAufgabe, answer: string): string {
  const u = urteil(answer, task.loesung);
  if (u === "richtig" || u === "gerundet") return "";
  if (meldung(u) !== "") return meldung(u);
  if (answer.includes("+") || trifft(answer, task.summe)) return ADDIERT;
  return TIPP;
}

/** Der Rechenweg. */
export const weg = (task: PfadAufgabe): string[] => [
  `Pfad: Start → ${task.namen.join(" → ")}`,
  `Zweige: ${task.zweige.join(", ")}`,
  `1. Pfadregel: P = ${task.term} = ${text(task.loesung)}`,
];

export function describe(task: PfadAufgabe, _props?: unknown, _lang?: string): { task: string; solution: string } {
  return {
    task: `${task.text} Das Bild zeigt den Baum, der Pfad ${task.namen.join("-")} ist orange.\n\n${task.label} …`,
    solution: weg(task).join("\n\n"),
  };
}

export const about = {
  task: "Die Wahrscheinlichkeit eines Pfades im Baumdiagramm berechnen (1. Pfadregel).",
  answer:
    "Eine Wahrscheinlichkeit: Bruch, Dezimalzahl auf mindestens zwei Nachkommastellen, Prozent oder ein Term wie 3/6·2/5.",
  correct: "Das Produkt der Zweigwahrscheinlichkeiten entlang des Pfades, exakt oder richtig gerundet.",
  mistakes: ["Entlang des Pfades addiert statt multipliziert."],
};
