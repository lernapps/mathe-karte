// Übung zum Baumdiagramm: Im Baum fehlen zwei bis vier Zweigwahrscheinlichkeiten (a, b, c, d); du trägst sie ein.
// Typischer Fehler ohne Zurücklegen: den Nenner nicht verkleinert. Rein, ohne DOM.
import { type Bruch, bruch, gleich, lies, meldung, stimmt, text, trifft, urteil } from "./ZufallBruch.ts";
import {
  type Versuchsart,
  alleKnoten,
  baueBaum,
  ergebnis,
  gesamt,
  nameVon,
  stufenWort,
  urnenSpec,
  versuchAus,
  versuchText,
  waehleVersuch,
  zufallAus,
} from "./ZufallModell.ts";
import { BUCHSTABEN } from "./ZufallBaum.ts";

export interface Luecke {
  buchstabe: string;
  id: string;
  beschreibung: string;
  anzahl: number;
  gesamt: number;
  loesung: Bruch;
  /** Der Wert mit vollem Nenner (wie mit Zurücklegen); gleich der Lösung, wenn sich nichts ändert. */
  voll: Bruch;
}

export interface LueckenAufgabe {
  experiment: Versuchsart;
  urne: string;
  zuege: number;
  mit: boolean;
  art: Versuchsart;
  text: string;
  luecken: Luecke[];
}

export function generate(seed: number, _props?: unknown): LueckenAufgabe {
  const z = zufallAus(seed);
  const { versuch, zuege, mit } = waehleVersuch(z);
  const baum = baueBaum(versuch, zuege, mit);
  const knoten = alleKnoten(baum);
  const anzahl = Math.min(knoten.length, z.wahl([2, 3, 3, 4]));
  const gewaehlt = [z.wahl(knoten.filter((k) => k.stufe >= 2))];
  if (anzahl > 1) gewaehlt.push(z.wahl(knoten.filter((k) => k.stufe === 1)));
  const rest = z.mischen(knoten.filter((k) => !gewaehlt.includes(k)));
  while (gewaehlt.length < anzahl) {
    const k = rest.pop();
    if (k === undefined) break;
    gewaehlt.push(k);
  }
  gewaehlt.sort((x, y) => knoten.indexOf(x) - knoten.indexOf(y));
  const alle = gesamt(versuch);
  const luecken = gewaehlt.map((k, i): Luecke => {
    const vorher = k.id
      .slice(0, -1)
      .split("")
      .map((id) => nameVon(versuch, id));
    return {
      buchstabe: BUCHSTABEN[i] ?? "",
      id: k.id,
      beschreibung: `${k.stufe}. ${stufenWort(versuch)}: ${k.name}${vorher.length > 0 ? ` (nach ${vorher.join(", ")})` : ""}`,
      anzahl: k.anzahl,
      gesamt: k.gesamt,
      loesung: k.w,
      voll: bruch(ergebnis(versuch, k.ergebnis)?.anzahl ?? 0, alle),
    };
  });
  const namen = luecken.map((l) => l.buchstabe).join(", ");
  return {
    experiment: versuch.art,
    urne: urnenSpec(versuch),
    zuege,
    mit: baum.mit,
    art: versuch.art,
    text: `${versuchText(versuch, zuege, baum.mit)} Im Baumdiagramm fehlen ${luecken.length} Zweigwahrscheinlichkeiten (${namen}). Trag sie ein.`,
    luecken,
  };
}

export type LueckenAntwort = Record<string, string>;

export const check = (task: LueckenAufgabe, answer: LueckenAntwort): boolean =>
  task.luecken.every((l) => stimmt(answer[l.buchstabe] ?? "", l.loesung));
export const solution = (task: LueckenAufgabe): LueckenAntwort =>
  Object.fromEntries(task.luecken.map((l) => [l.buchstabe, text(l.loesung)]));
export const wrong = (task: LueckenAufgabe): LueckenAntwort =>
  Object.fromEntries(task.luecken.map((l) => [l.buchstabe, "2"]));

export function tipp(task: LueckenAufgabe): string {
  if (task.art !== "urne") {
    return "Jeder Zweig zeigt die Wahrscheinlichkeit eines Ergebnisses. Jeder Wurf ist wie der erste: Die Zweige sind auf jeder Stufe gleich. Die Zweige an einem Knoten ergeben zusammen 1.";
  }
  return task.mit
    ? "Jeder Zweig zeigt: Anzahl der passenden Kugeln geteilt durch alle Kugeln. Mit Zurücklegen bleibt das auf jeder Stufe gleich. Die Zweige an einem Knoten ergeben zusammen 1."
    : "Ohne Zurücklegen fehlt auf der nächsten Stufe eine Kugel: Der Nenner wird um 1 kleiner – und der Zähler einer Farbe auch, wenn vorher eine Kugel dieser Farbe gezogen wurde. Die Zweige an einem Knoten ergeben zusammen 1.";
}

/** Warum eine Antwort falsch ist: welche Zweige nicht stimmen, und wenn möglich warum. */
export function grund(task: LueckenAufgabe, answer: LueckenAntwort): string {
  const falsch = task.luecken.filter((l) => !stimmt(answer[l.buchstabe] ?? "", l.loesung));
  if (falsch.length === 0) return "";
  const teile = [`Noch nicht richtig: ${falsch.map((l) => l.buchstabe).join(", ")}.`];
  const urteile = falsch.map((l) => urteil(answer[l.buchstabe] ?? "", l.loesung));
  const allgemein = urteile.map(meldung).find((m) => m !== "");
  const voll = falsch.some((l) => !gleich(l.voll, l.loesung) && trifft(answer[l.buchstabe] ?? "", l.voll));
  if (voll) teile.push("Ohne Zurücklegen fehlt nach jedem Zug eine Kugel: Der Nenner wird kleiner.");
  else if (allgemein !== undefined) teile.push(allgemein);
  else if (
    falsch.some((l) => (lies(answer[l.buchstabe] ?? "")?.wert.z ?? 0) > (lies(answer[l.buchstabe] ?? "")?.wert.n ?? 1))
  ) {
    teile.push("Eine Wahrscheinlichkeit ist nie größer als 1.");
  } else teile.push("Prüfe Zähler und Nenner.");
  return teile.join(" ");
}

/** Die Meldung der App zu einer falschen Antwort (Vertrag der Übung): grund. */
export const reason = (task: LueckenAufgabe, answer: LueckenAntwort, _props?: unknown, _lang?: string): string =>
  grund(task, answer);

/**
 * Die Antwort jedes typischen Fehlers aus about.mistakes (nur ohne Zurücklegen aus einer Urne): jede Lücke ab der
 * zweiten Stufe mit dem Nenner der ersten; mit dem Zähler vor dem Ziehen. Die übrigen Lücken richtig.
 */
export function mistakes(task: LueckenAufgabe, _props?: unknown): (LueckenAntwort | undefined)[] {
  if (task.art !== "urne" || task.mit) return [undefined, undefined];
  // die Kugeln vor dieser Stufe: ihre ids sind die Zeichen der id vor dem letzten
  const vorher = (l: Luecke) => l.id.slice(0, -1).split("");
  const nenner = (l: Luecke) => bruch(l.anzahl, l.gesamt + vorher(l).length);
  const zaehler = (l: Luecke) => bruch(l.anzahl + vorher(l).filter((id) => id === l.id.at(-1)).length, l.gesamt);
  const mit = (falsch: (l: Luecke) => Bruch): LueckenAntwort | undefined => {
    const antwort = Object.fromEntries(task.luecken.map((l) => [l.buchstabe, text(falsch(l))]));
    return check(task, antwort) ? undefined : antwort;
  };
  return [mit(nenner), mit(zaehler)];
}

/** Die Aufgabe, wie das Kind sie liest, mit {Versuch} und {Lücken}. */
export const template = (_props?: unknown, _lang?: string): string =>
  "{Versuch} Im Baumdiagramm fehlen Zweigwahrscheinlichkeiten. Trag sie ein. Das Bild zeigt den Baum; an den fehlenden Zweigen steht „?“ und ihr Buchstabe. Die Felder: {Lücken}.";

/** Was eine Aufgabe festlegt: der Versuch und die Lücken mit ihren Zweigen. */
export const params = (task: LueckenAufgabe, _props?: unknown, _lang?: string): Record<string, string> => ({
  Versuch: versuchText(versuchAus(task.experiment, task.urne), task.zuege, task.mit),
  Lücken: task.luecken.map((l) => `${l.buchstabe}) ${l.beschreibung}`).join("; "),
});

/** Eine Antwort als Text: jeder Buchstabe mit seinem Wert. */
export const show = (answer: LueckenAntwort, task: LueckenAufgabe, _props?: unknown, _lang?: string): string =>
  task.luecken.map((l) => `${l.buchstabe}) ${(answer[l.buchstabe] ?? "").trim() || "leer"}`).join("; ");

export const weg = (task: LueckenAufgabe): string[] =>
  task.luecken.map((l) => {
    const roh = `${l.anzahl}/${l.gesamt}`;
    const kurz = text(l.loesung);
    return `${l.buchstabe}) ${l.beschreibung}: ${l.anzahl} von ${l.gesamt} → ${roh}${kurz === roh ? "" : ` = ${kurz}`}`;
  });

export function describe(task: LueckenAufgabe, _props?: unknown, _lang?: string): { task: string; solution: string } {
  const felder = task.luecken.map((l) => `- ${l.buchstabe}) ${l.beschreibung} = …`).join("\n");
  return {
    task: `${task.text} Das Bild zeigt den Baum; an den fehlenden Zweigen steht „?“ und ihr Buchstabe.\n\n${felder}`,
    solution: weg(task).join("\n\n"),
  };
}

export const about = {
  task: "In einem Baumdiagramm zu einem mehrstufigen Zufallsversuch (Urne mit oder ohne Zurücklegen, Münze, Würfel „6 / keine 6“) die fehlenden Zweigwahrscheinlichkeiten a, b, c, d eintragen.",
  answer:
    "Je Buchstabe eine Wahrscheinlichkeit in einem Feld, dann „Prüfen“ unter der Aufgabe: Bruch, Dezimalzahl auf mindestens zwei Nachkommastellen oder Prozent. Nach einer falschen Antwort gibt es „Lösung zeigen“ mit dem Rechenweg.",
  correct:
    "Jeder Zweig: Anzahl der passenden Kugeln (Ergebnisse) durch alle, die auf dieser Stufe noch da sind; alle Felder richtig.",
  mistakes: [
    "Ohne Zurücklegen den Nenner der zweiten Stufe nicht um 1 verkleinert.",
    "Ohne Zurücklegen den Zähler nicht verkleinert, obwohl vorher dieselbe Farbe gezogen wurde.",
  ],
};
