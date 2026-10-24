// Übung zur Laplace-Formel: P(E) = günstige durch mögliche Ergebnisse, mit Würfel, Urne, Glücksrad, Skatkarten, Losen
// und zwei Würfeln. Typischer Fehler: bei der Urne Farben statt Kugeln gezählt. Rein, ohne DOM.
import { type Bruch, bruch, meldung, stimmt, text, trifft, urteil } from "./ZufallBruch.ts";
import { type Menge, frage, waehleMenge } from "./ZufallMenge.ts";
import { zufallAus } from "./ZufallModell.ts";

export interface LaplaceAufgabe {
  menge: Menge;
  guenstig: number;
  moeglich: number;
  p: Bruch;
  text: string;
}

export function generate(seed: number, _props?: unknown): LaplaceAufgabe {
  const menge = waehleMenge(zufallAus(seed));
  const guenstig = menge.elemente.filter((e) => e.guenstig).length;
  const moeglich = menge.elemente.length;
  return {
    menge,
    guenstig,
    moeglich,
    p: bruch(guenstig, moeglich),
    text: `${menge.kontext} ${frage(menge, menge.ereignisName)}`,
  };
}

export const check = (task: LaplaceAufgabe, answer: string): boolean => stimmt(answer, task.p);
export const solution = (task: LaplaceAufgabe): string => text(task.p);
export const wrong = (task: LaplaceAufgabe): string => `${task.moeglich}/${task.guenstig}`;

export const tipp = (task: LaplaceAufgabe): string =>
  `Zähle zuerst alle möglichen Ergebnisse (hier ${task.moeglich}). Zähle dann, wie viele davon zum Ereignis „${task.menge.ereignisName}“ passen. Teile günstig durch möglich.`;

/** Warum eine Antwort falsch ist. */
export function grund(task: LaplaceAufgabe, answer: string): string {
  const u = urteil(answer, task.p);
  if (u === "richtig" || u === "gerundet") return "";
  if (meldung(u) !== "") return meldung(u);
  const farben = task.menge.farben;
  if (farben > 1 && trifft(answer, bruch(1, farben))) {
    return `Du hast Farben gezählt. Jede einzelne Kugel ist ein Ergebnis: Es gibt ${task.moeglich} Kugeln, nicht ${farben} Farben.`;
  }
  if (trifft(answer, bruch(task.guenstig, task.moeglich - task.guenstig))) {
    return "Du hast günstig durch die übrigen Ergebnisse geteilt. Im Nenner stehen alle möglichen Ergebnisse.";
  }
  return tipp(task);
}

export function weg(task: LaplaceAufgabe): string[] {
  const roh = `${task.guenstig}/${task.moeglich}`;
  const kurz = text(task.p);
  return [
    `Mögliche Ergebnisse: ${task.moeglich}`,
    `Günstige Ergebnisse (${task.menge.ereignisName}): ${task.guenstig}`,
    `P(E) = günstig / möglich = ${roh}${kurz === roh ? "" : ` = ${kurz}`}`,
  ];
}

export function describe(task: LaplaceAufgabe, _props?: unknown, _lang?: string): { task: string; solution: string } {
  return {
    task: `${task.text}\n\nDas Bild zeigt alle ${task.moeglich} möglichen Ergebnisse; du kannst die günstigen anklicken.\n\nP(E) = …`,
    solution: weg(task).join("\n\n"),
  };
}

export const about = {
  task: "Mit der Laplace-Formel die Wahrscheinlichkeit eines Ereignisses bei einem Würfel, einer Urne, einem Glücksrad, Skatkarten, Losen oder zwei Würfeln berechnen.",
  answer: "Eine Wahrscheinlichkeit: Bruch, Dezimalzahl auf mindestens zwei Nachkommastellen oder Prozent.",
  correct: "Anzahl der günstigen durch Anzahl aller möglichen Ergebnisse, exakt oder richtig gerundet.",
  mistakes: [
    "Bei der Urne Farben statt Kugeln gezählt (1 durch Anzahl der Farben).",
    "Günstige durch ungünstige statt durch alle Ergebnisse geteilt.",
  ],
};
