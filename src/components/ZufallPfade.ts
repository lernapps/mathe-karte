// Übung zur 2. Pfadregel und zum Übersetzen von Ereignissen in Pfade: Pfade eines Ereignisses im Baum anklicken und
// P(E) als Summe ihrer Pfadwahrscheinlichkeiten berechnen. art "uebersetzen": zwei Züge mit Zurücklegen aus einer Urne,
// Ereignis „genau einmal“, „beide gleich“ oder „mindestens einmal“. Geprüft wird P(E); die angeklickten Pfade helfen
// bei der Diagnose. Typischer Fehler: nur ein Pfad. Rein, ohne DOM.
import { type Bruch, meldung, stimmt, text, trifft, urteil } from "./ZufallBruch.ts";
import {
  type Baum,
  type Versuchsart,
  baueBaum,
  ereignisName,
  ereignisPfade,
  ereignisW,
  moeglicheEreignisse,
  pfadName,
  pfadTerm,
  urne,
  URNEN,
  urnenSpec,
  versuchAus,
  versuchText,
  waehleVersuch,
  zufallAus,
} from "./ZufallModell.ts";

export interface PfadeAufgabe {
  experiment: Versuchsart;
  urne: string;
  zuege: number;
  mit: boolean;
  code: string;
  name: string;
  pfade: string[];
  namen: string[];
  produkte: string[];
  werte: Bruch[];
  loesung: Bruch;
  text: string;
}

export interface PfadeProps {
  art?: "pfadregel" | "uebersetzen";
}

function aufgabe(baum: Baum, code: string, name: string): PfadeAufgabe {
  const pfade = ereignisPfade(baum, code);
  return {
    experiment: baum.versuch.art,
    urne: urnenSpec(baum.versuch),
    zuege: baum.zuege,
    mit: baum.mit,
    code,
    name,
    pfade: pfade.map((k) => k.id),
    namen: pfade.map((k) => pfadName(baum, k.id)),
    produkte: pfade.map((k) => pfadTerm(baum, k.id)),
    werte: pfade.map((k) => k.pw),
    loesung: ereignisW(baum, code),
    text: `${versuchText(baum.versuch, baum.zuege, baum.mit)} Ereignis E: „${name}“. Klick im Baum die Pfade an, die zu E gehören, und berechne dann P(E).`,
  };
}

export function generate(seed: number, props?: PfadeProps): PfadeAufgabe {
  const z = zufallAus(seed);
  if (props?.art === "uebersetzen") {
    const spec = z.wahl(URNEN);
    const v = urne(spec);
    const farbe = v.ergebnisse[0]?.id ?? "r";
    const code = z.wahl([`genau1${farbe}`, "allegleich", `mind1${farbe}`]);
    return aufgabe(baueBaum(v, 2, true), code, ereignisName(v, 2, code) ?? "");
  }
  const { versuch, zuege, mit } = waehleVersuch(z);
  const baum = baueBaum(versuch, zuege, mit);
  const passend = moeglicheEreignisse(versuch, zuege).filter((e) => {
    const n = ereignisPfade(baum, e.code).length;
    return n >= 2 && n <= 8;
  });
  const e =
    passend.length > 0
      ? z.wahl(passend)
      : { code: "allegleich", name: ereignisName(versuch, zuege, "allegleich") ?? "" };
  return aufgabe(baum, e.code, e.name);
}

export interface PfadeAntwort {
  antwort: string;
  auswahl?: string[];
}

export const check = (task: PfadeAufgabe, answer: PfadeAntwort): boolean => stimmt(answer.antwort, task.loesung);
export const solution = (task: PfadeAufgabe): PfadeAntwort => ({ antwort: text(task.loesung), auswahl: task.pfade });
export const wrong = (task: PfadeAufgabe): PfadeAntwort => ({ antwort: text(task.werte[0] ?? task.loesung) + "+1" });

export const TIPP =
  "Schreib zu jedem Pfad das Produkt seiner Zweige auf (1. Pfadregel). Dann addiere die Produkte aller passenden Pfade (2. Pfadregel). Deine Antwort darf als Produkt, Summe oder Potenz stehen bleiben.";
export const NUR_EIN_PFAD =
  "Das ist nur ein Pfad. Addiere die Wahrscheinlichkeiten aller passenden Pfade (2. Pfadregel).";

/** Was an der Auswahl der Pfade nicht stimmt; leer, wenn sie stimmt oder nichts gewählt ist. */
export function auswahlFehler(task: PfadeAufgabe, auswahl: readonly string[]): string {
  if (auswahl.length === 0) return "";
  const soll = new Set(task.pfade);
  const ist = new Set(auswahl);
  const fehlend = [...soll].filter((id) => !ist.has(id)).length;
  const zuviel = [...ist].filter((id) => !soll.has(id)).length;
  if (fehlend === 0 && zuviel === 0) return "";
  const teile = [];
  if (fehlend > 0) teile.push(`Es ${fehlend === 1 ? "fehlt noch 1 Pfad" : `fehlen noch ${fehlend} Pfade`}.`);
  if (zuviel > 0) teile.push(`${zuviel === 1 ? "1 Pfad gehört" : `${zuviel} Pfade gehören`} nicht zu E.`);
  teile.push("Lies das Ereignis noch einmal genau.");
  return teile.join(" ");
}

/** Warum eine Antwort falsch ist. */
export function grund(task: PfadeAufgabe, answer: PfadeAntwort): string {
  const u = urteil(answer.antwort, task.loesung);
  if (u === "richtig" || u === "gerundet") return "";
  if (meldung(u) !== "") return meldung(u);
  const auswahl = auswahlFehler(task, answer.auswahl ?? []);
  if (auswahl !== "") return auswahl;
  if (task.werte.some((w) => trifft(answer.antwort, w))) return NUR_EIN_PFAD;
  return TIPP;
}

/** Die Meldung der App zu einer falschen Antwort (Vertrag der Übung): grund. */
export const reason = (task: PfadeAufgabe, answer: PfadeAntwort, _props?: unknown, _lang?: string): string =>
  grund(task, answer);

/** Die Antwort jedes typischen Fehlers aus about.mistakes: nur der erste Pfad; falsch gewählte Pfade haben viele. */
export function mistakes(task: PfadeAufgabe, _props?: unknown): (PfadeAntwort | undefined)[] {
  const erster = task.werte[0];
  const nurEiner = task.pfade.length > 1 && erster !== undefined ? { antwort: text(erster) } : undefined;
  return [nurEiner, undefined].map((a) => (a === undefined || check(task, a) ? undefined : a));
}

/** Die Aufgabe, wie das Kind sie liest, mit {Versuch} und {Ereignis}; die passenden Pfade ({Pfade}) sieht es nicht. */
export const template = (_props?: unknown, _lang?: string): string =>
  "{Versuch} Ereignis E: „{Ereignis}“. Klick im Baum die Pfade an, die zu E gehören, und berechne dann P(E). Das Bild zeigt den Baum; das Kind kann die Enden der Pfade anklicken (das zählt nicht, hilft aber der Rückmeldung) und tippt P(E).";

/** Was eine Aufgabe festlegt: der Versuch, das Ereignis und die Pfade, die zu E gehören. */
export const params = (task: PfadeAufgabe, _props?: unknown, _lang?: string): Record<string, string> => ({
  Versuch: versuchText(versuchAus(task.experiment, task.urne), task.zuege, task.mit),
  Ereignis: task.name,
  Pfade: task.namen.join("; "),
});

/** Eine Antwort als Text: P(E) und wie viele Pfade angeklickt sind. */
export function show(answer: PfadeAntwort, _task?: PfadeAufgabe, _props?: unknown, _lang?: string): string {
  const n = answer.auswahl?.length ?? 0;
  return n === 0 ? answer.antwort.trim() : `${answer.antwort.trim()} (${n} ${n === 1 ? "Pfad" : "Pfade"} angeklickt)`;
}

export function weg(task: PfadeAufgabe): string[] {
  const namen = task.namen.join(", ");
  return [
    `Passende Pfade (${task.pfade.length}): ${namen}`,
    `Jeder Pfad als Produkt: ${task.produkte.map((t, i) => `${t} = ${text(task.werte[i] ?? task.loesung)}`).join("; ")}`,
    `2. Pfadregel: P(E) = ${task.produkte.join(" + ")} = ${text(task.loesung)}`,
  ];
}

export function describe(task: PfadeAufgabe, _props?: unknown, _lang?: string): { task: string; solution: string } {
  return {
    task: `${task.text}\n\nDas Bild zeigt den Baum; du kannst die Enden der Pfade anklicken.\n\nP(E) = …`,
    solution: weg(task).join("\n\n"),
  };
}

export const about = {
  task: "Ein Ereignis in Worten (genau einmal, mindestens einmal, kein Mal, alle gleich, alle verschieden) in Pfade des Baumdiagramms übersetzen, die Pfade anklicken und P(E) mit der 2. Pfadregel berechnen.",
  answer:
    "Eine Wahrscheinlichkeit ins Feld P(E) getippt, dann „Prüfen“ unter der Aufgabe: Bruch, Dezimalzahl auf mindestens zwei Nachkommastellen, Prozent oder ein Term wie 3/6*2/5+2/6*3/5. Die angeklickten Pfade werden nicht bewertet, nur zur Rückmeldung genutzt. Nach einer falschen Antwort gibt es „Lösung zeigen“ mit dem Rechenweg.",
  correct: "Die Summe der Pfadwahrscheinlichkeiten aller Pfade, die zum Ereignis gehören, exakt oder richtig gerundet.",
  mistakes: [
    "Nur einen Pfad genommen statt alle passenden zu addieren.",
    "Pfade gewählt, die nicht zum Ereignis gehören, oder passende vergessen.",
  ],
};
