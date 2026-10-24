// Die Eingabe der Übungen des Kapitels Zufall (ZufallAntwort.vue), rein: ein oder mehrere Felder für eine
// Wahrscheinlichkeit, als Bruch, Dezimalzahl, Prozent oder Term.

export interface Feld {
  id: string;
  label: string;
}

/** Der Hinweis unter den Feldern. */
export const HINWEIS = "Bruch, Dezimalzahl oder Prozent, z. B. 1/6, 0,17 oder 17 %. Ein Term wie 3/6*2/5 geht auch.";

/** Leere Werte für alle Felder. */
export const leereWerte = (felder: readonly Feld[]): Record<string, string> =>
  Object.fromEntries(felder.map((f) => [f.id, ""]));

/** Ob in jedem Feld etwas steht. */
export const vollstaendig = (werte: Readonly<Record<string, string>>, felder: readonly Feld[]): boolean =>
  felder.every((f) => (werte[f.id] ?? "").trim() !== "");
