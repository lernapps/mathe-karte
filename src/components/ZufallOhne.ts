// Übung zum Ziehen ohne Zurücklegen: dieselbe Urne mit und ohne Zurücklegen vergleichen. zweig: P(2. Kugel Y), wenn die
// erste X war; pfad: P(X, dann Y). Typischer Fehler: ohne Zurücklegen den Wert mit Zurücklegen genommen. Rein.
import { type Bruch, bruch, gleich, mal, meldung, stimmt, text, trifft, urteil } from "./ZufallBruch.ts";
import { URNEN, entferne, ergebnis, gesamt, kugelListe, urne, wahrscheinlichkeit, zufallAus } from "./ZufallModell.ts";

export interface OhneAufgabe {
  urne: string;
  erster: string;
  zweiter: string;
  art: "zweig" | "pfad";
  nameE: string;
  nameZ: string;
  gesamt: number;
  anzE: number;
  anzZ: number;
  anzZDanach: number;
  mit: Bruch;
  ohne: Bruch;
  text: string;
  beschriftung: string;
}

export function generate(seed: number, _props?: unknown): OhneAufgabe {
  const z = zufallAus(seed);
  const spec = z.wahl(URNEN);
  const v = urne(spec);
  const ids = v.ergebnisse.map((e) => e.id);
  const erster = z.wahl(ids);
  const zweiter = z.wahl(ids);
  const art = z.wahl(["zweig", "zweig", "pfad"] as const);
  const danach = entferne(v, erster);
  const pErster = wahrscheinlichkeit(v, erster);
  const zweigMit = wahrscheinlichkeit(v, zweiter);
  const zweigOhne = wahrscheinlichkeit(danach, zweiter);
  const nameE = ergebnis(v, erster)?.name ?? "";
  const nameZ = ergebnis(v, zweiter)?.name ?? "";
  const alle = gesamt(v);
  const anzZ = ergebnis(v, zweiter)?.anzahl ?? 0;
  const kontext = `In einer Urne liegen ${kugelListe(v.ergebnisse)} (${alle} insgesamt). Du ziehst zweimal.`;
  const zweig = art === "zweig";
  return {
    urne: spec,
    erster,
    zweiter,
    art,
    nameE,
    nameZ,
    gesamt: alle,
    anzE: ergebnis(v, erster)?.anzahl ?? 0,
    anzZ,
    anzZDanach: anzZ - (erster === zweiter ? 1 : 0),
    mit: zweig ? zweigMit : mal(pErster, zweigMit),
    ohne: zweig ? zweigOhne : mal(pErster, zweigOhne),
    text: zweig
      ? `${kontext} Die erste Kugel ist ${nameE}. Wie groß ist jetzt die Wahrscheinlichkeit, dass die zweite Kugel ${nameZ} ist – (1) mit Zurücklegen und (2) ohne Zurücklegen?`
      : `${kontext} Wie groß ist P(${nameE}, dann ${nameZ}) – (1) mit Zurücklegen und (2) ohne Zurücklegen?`,
    beschriftung: zweig ? `P(2. Kugel ${nameZ})` : `P(${nameE}, dann ${nameZ})`,
  };
}

export type OhneAntwort = Record<string, string>;

export const check = (task: OhneAufgabe, answer: OhneAntwort): boolean =>
  stimmt(answer["mit"] ?? "", task.mit) && stimmt(answer["ohne"] ?? "", task.ohne);
export const solution = (task: OhneAufgabe): OhneAntwort => ({ mit: text(task.mit), ohne: text(task.ohne) });
export const wrong = (task: OhneAufgabe): OhneAntwort => ({ mit: text(task.mit), ohne: "2" });

export function tipp(task: OhneAufgabe): string {
  if (task.art === "pfad") {
    return "Beide Male: 1. Pfadregel, also multiplizieren. Nur der zweite Zweig unterscheidet sich: ohne Zurücklegen fehlt eine Kugel in der Urne.";
  }
  const auch = task.erster === task.zweiter ? ` und nur noch ${task.anzZDanach} ${task.nameZ}e` : "";
  return `Mit Zurücklegen ist die Urne beim zweiten Zug wie am Anfang. Ohne Zurücklegen fehlt die ${task.nameE}e Kugel: nur noch ${task.gesamt - 1} Kugeln${auch}.`;
}

/** Warum eine Antwort falsch ist: welcher Wert nicht stimmt, und ob „ohne“ der Wert „mit“ ist. */
export function grund(task: OhneAufgabe, answer: OhneAntwort): string {
  const mit = answer["mit"] ?? "";
  const ohne = answer["ohne"] ?? "";
  const teile: string[] = [];
  const uMit = urteil(mit, task.mit);
  const uOhne = urteil(ohne, task.ohne);
  const okMit = uMit === "richtig" || uMit === "gerundet";
  const okOhne = uOhne === "richtig" || uOhne === "gerundet";
  if (okMit && okOhne) return "";
  if (!okMit && uMit === "falsch") teile.push("Der Wert mit Zurücklegen stimmt noch nicht.");
  if (!okOhne && uOhne === "falsch") {
    teile.push(
      !gleich(task.mit, task.ohne) && trifft(ohne, task.mit)
        ? "Ohne Zurücklegen hast du den Wert mit Zurücklegen genommen. Es fehlt eine Kugel – der Nenner wird kleiner."
        : "Der Wert ohne Zurücklegen stimmt noch nicht.",
    );
  }
  const allgemein = [uMit, uOhne].map(meldung).find((m) => m !== "");
  if (allgemein !== undefined) teile.push(allgemein);
  teile.push(tipp(task));
  return teile.join(" ");
}

/** Die Meldung der App zu einer falschen Antwort (Vertrag der Übung): grund. */
export const reason = (task: OhneAufgabe, answer: OhneAntwort, _props?: unknown, _lang?: string): string =>
  grund(task, answer);

/**
 * Die Antwort jedes typischen Fehlers aus about.mistakes: ohne Zurücklegen der Wert mit Zurücklegen; ohne Zurücklegen
 * den Zähler nicht verkleinert (nur, wenn die erste Kugel dieselbe Farbe hat).
 */
export function mistakes(task: OhneAufgabe, _props?: unknown): (OhneAntwort | undefined)[] {
  const mit = text(task.mit);
  const zweigOhneZaehler = bruch(task.anzZ, task.gesamt - 1);
  const zaehler = task.art === "zweig" ? zweigOhneZaehler : mal(bruch(task.anzE, task.gesamt), zweigOhneZaehler);
  return [{ mit, ohne: mit }, task.erster === task.zweiter ? { mit, ohne: text(zaehler) } : undefined].map((a) =>
    a === undefined || check(task, a) ? undefined : a,
  );
}

/** Die Aufgabe, wie das Kind sie liest, mit {Aufgabe}. */
export const template = (_props?: unknown, _lang?: string): string =>
  "{Aufgabe} Das Bild zeigt die Urne vor und nach dem ersten Zug und die Bäume mit und ohne Zurücklegen. Das Kind tippt (1) den Wert mit und (2) den Wert ohne Zurücklegen.";

/** Was eine Aufgabe festlegt: ihr Text. */
export const params = (task: OhneAufgabe, _props?: unknown, _lang?: string): Record<string, string> => ({
  Aufgabe: task.text,
});

/** Eine Antwort als Text: beide Werte. */
export const show = (answer: OhneAntwort, _task?: OhneAufgabe, _props?: unknown, _lang?: string): string =>
  `(1) mit: ${(answer["mit"] ?? "").trim() || "leer"}; (2) ohne: ${(answer["ohne"] ?? "").trim() || "leer"}`;

export function weg(task: OhneAufgabe): string[] {
  const roh = (z: number, n: number) => {
    const kurz = text(bruch(z, n));
    return `${z}/${n}` === kurz ? kurz : `${z}/${n} = ${kurz}`;
  };
  if (task.art === "zweig") {
    return [
      `Mit Zurücklegen: ${task.anzZ} ${task.nameZ}e von ${task.gesamt} Kugeln → ${roh(task.anzZ, task.gesamt)}`,
      `Ohne Zurücklegen: die ${task.nameE}e Kugel ist weg → ${task.anzZDanach} ${task.nameZ}e von ${task.gesamt - 1} Kugeln → ${roh(task.anzZDanach, task.gesamt - 1)}`,
    ];
  }
  return [
    `Mit Zurücklegen: ${task.anzE}/${task.gesamt} · ${task.anzZ}/${task.gesamt} = ${text(task.mit)}`,
    `Ohne Zurücklegen: ${task.anzE}/${task.gesamt} · ${task.anzZDanach}/${task.gesamt - 1} = ${text(task.ohne)}`,
  ];
}

export function describe(task: OhneAufgabe, _props?: unknown, _lang?: string): { task: string; solution: string } {
  return {
    task: `${task.text}\n\nDas Bild zeigt die Urne vor und nach dem ersten Zug (${task.nameE} gezogen) und darunter die Bäume mit und ohne Zurücklegen; der Pfad ${task.nameE}-${task.nameZ} ist orange.\n\n- (1) ${task.beschriftung} mit Zurücklegen = …\n- (2) ${task.beschriftung} ohne Zurücklegen = …`,
    solution: weg(task).join("\n\n"),
  };
}

export const about = {
  task: "Dieselbe Urne mit und ohne Zurücklegen vergleichen: die Wahrscheinlichkeit für die zweite Kugel nach einer bekannten ersten, oder für einen Pfad aus zwei Zügen.",
  answer:
    "Zwei Wahrscheinlichkeiten in zwei Feldern, (1) mit und (2) ohne Zurücklegen, dann „Prüfen“ unter der Aufgabe: Bruch, Dezimalzahl auf mindestens zwei Nachkommastellen, Prozent oder Term. Nach einer falschen Antwort gibt es „Lösung zeigen“ mit dem Rechenweg.",
  correct:
    "Mit Zurücklegen wie beim ersten Zug; ohne Zurücklegen eine Kugel weniger im Nenner, und im Zähler eine weniger, wenn dieselbe Farbe schon gezogen wurde. Beide Werte richtig.",
  mistakes: [
    "Ohne Zurücklegen den Wert mit Zurücklegen genommen (Nenner nicht verkleinert).",
    "Ohne Zurücklegen den Zähler nicht verkleinert, obwohl dieselbe Farbe schon gezogen wurde.",
  ],
};
