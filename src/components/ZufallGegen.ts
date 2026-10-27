// Übung zum Gegenereignis: P(nicht E) = 1 − P(E), in drei Arten. direkt: P(E) ist gegeben; einfach: das Gegenereignis
// eines Laplace-Ereignisses (Würfel, Urne, Glücksrad, Karten, Lose, zwei Würfel); mindestens: „mindestens einmal“ bei
// zwei oder drei Zügen über das Gegenereignis „kein einziges Mal“. Typischer Fehler: P(E) statt 1 − P(E). Rein.
import { type Bruch, bruch, EINS, endStellen, meldung, minus, stimmt, text, trifft, urteil } from "./ZufallBruch.ts";
import { type Menge, frage, waehleMenge } from "./ZufallMenge.ts";
import {
  type Versuch,
  type Versuchsart,
  baueBaum,
  ereignisName,
  ereignisPfade,
  ereignisW,
  kugelListe,
  muenze,
  nameVon,
  nurErgebnisUndRest,
  urne,
  URNEN,
  urnenSpec,
  wuerfelSechs,
  zufallAus,
  zweigeEntlang,
} from "./ZufallModell.ts";

export type Gegenart = "direkt" | "einfach" | "mindestens";

export interface Mindestens {
  experiment: Versuchsart;
  urne: string;
  zuege: number;
  mit: boolean;
  id: string;
  /** Im Bild nur „Ergebnis / nicht Ergebnis“ (ab drei Zügen), sonst leer. */
  nurErgebnis: string;
  gegenCode: string;
  gegenName: string;
  name: string;
  term: string;
}

export interface GegenAufgabe {
  art: Gegenart;
  p: Bruch;
  loesung: Bruch;
  text: string;
  label: string;
  menge?: Menge;
  mind?: Mindestens;
}

const P_VORLAGEN = [
  bruch(1, 6),
  bruch(1, 4),
  bruch(2, 5),
  bruch(3, 8),
  bruch(1, 3),
  bruch(5, 12),
  bruch(7, 10),
  bruch(3, 10),
  bruch(9, 20),
];
const HOCH = "⁰¹²³⁴⁵⁶⁷⁸⁹";

function direkt(p: Bruch): GegenAufgabe {
  return {
    art: "direkt",
    p,
    loesung: minus(EINS, p),
    text: `Für ein Ereignis E gilt: P(E) = ${text(p)}. Wie groß ist die Gegenwahrscheinlichkeit P(nicht E)?`,
    label: "P(nicht E) =",
  };
}

function einfach(menge: Menge): GegenAufgabe {
  const p = bruch(menge.elemente.filter((e) => e.guenstig).length, menge.elemente.length);
  return {
    art: "einfach",
    p,
    loesung: minus(EINS, p),
    text: `${menge.kontext} ${frage(menge, menge.gegenFrage)} (nicht E: ${menge.gegenKurz})`,
    label: "P(nicht E) =",
    menge,
  };
}

function versuchFuer(art: "wuerfel" | "muenze" | "urne", spec: string): Versuch {
  return art === "wuerfel" ? wuerfelSechs() : art === "muenze" ? muenze() : urne(spec);
}

function mindestens(versuch: Versuch, zuege: number, mit: boolean, id: string): GegenAufgabe | undefined {
  const zwei = nurErgebnisUndRest(versuch, id);
  const bildVersuch = zuege >= 3 ? zwei : versuch;
  const gegenCode = `kein${id}`;
  const pGegen = ereignisW(baueBaum(bildVersuch, zuege, mit), gegenCode);
  if (pGegen.z === 0) return undefined;
  const rechenBaum = baueBaum(zwei, zuege, mit);
  const pfad = ereignisPfade(rechenBaum, gegenCode)[0];
  const faktoren = pfad === undefined ? [] : zweigeEntlang(rechenBaum, pfad.id).map((k) => text(k.w));
  const gleich = faktoren.every((f) => f === faktoren[0]);
  const erster = faktoren[0] ?? "";
  const term = gleich ? `(${erster})${HOCH[zuege] ?? ""}` : faktoren.join(" · ");
  const gegenName = ereignisName(bildVersuch, zuege, gegenCode) ?? "";
  const name = nameVon(versuch, id);
  const beschreibung =
    versuch.art === "urne"
      ? `In einer Urne liegen ${kugelListe(versuch.ergebnisse)}.`
      : versuch.art === "muenze"
        ? "Du hast eine faire Münze."
        : "Du hast einen normalen Würfel; es zählt nur „6“ oder „keine 6“.";
  const aktion = versuch.art === "muenze" ? "wirfst die Münze" : versuch.art === "wuerfel" ? "würfelst" : "ziehst";
  const zurueck = versuch.art === "urne" ? (mit ? " mit Zurücklegen" : " ohne Zurücklegen") : "";
  return {
    art: "mindestens",
    p: pGegen,
    loesung: minus(EINS, pGegen),
    text: `${beschreibung} Du ${aktion} ${zuege}-mal${zurueck}. Wie groß ist die Wahrscheinlichkeit, dass du mindestens einmal „${name}“ bekommst?`,
    label: "P(mindestens einmal) =",
    mind: {
      experiment: versuch.art,
      urne: urnenSpec(versuch),
      zuege,
      mit,
      id,
      nurErgebnis: zuege >= 3 ? id : "",
      gegenCode,
      gegenName,
      name,
      term,
    },
  };
}

export function generate(seed: number, _props?: unknown): GegenAufgabe {
  const z = zufallAus(seed);
  const art = z.wahl(["direkt", "einfach", "mindestens", "mindestens"] as const);
  if (art === "direkt") return direkt(z.wahl(P_VORLAGEN));
  if (art === "einfach") return einfach(waehleMenge(z));
  for (;;) {
    const welche = z.wahl(["wuerfel", "muenze", "urne", "urne"] as const);
    const versuch = versuchFuer(welche, z.wahl(URNEN));
    const mit = welche === "urne" ? z.wahl([true, false]) : true;
    // beim Würfel „mindestens einmal 6“: „mindestens einmal keine 6“ wäre fast sicher und klingt verdreht
    const id = welche === "wuerfel" ? "s" : z.wahl(versuch.ergebnisse).id;
    const aufgabe = mindestens(versuch, z.wahl([2, 3]), mit, id);
    if (aufgabe !== undefined) return aufgabe;
  }
}

export const check = (task: GegenAufgabe, answer: string): boolean => stimmt(answer, task.loesung);
export const solution = (task: GegenAufgabe): string => text(task.loesung);
export const wrong = (_task: GegenAufgabe): string => "0";

const gegenKurz = (m: Mindestens) => m.gegenName.replace("kein einziges Mal", "kein Mal");

export function tipp(task: GegenAufgabe): string {
  if (task.art === "direkt")
    return "Die Wahrscheinlichkeiten von E und „nicht E“ ergeben zusammen 1 (also 100 %). Rechne 1 − P(E).";
  if (task.art === "einfach") {
    const m = task.menge;
    return `E heißt: ${m?.ereignisName ?? ""}. Rechne zuerst P(E) mit der Laplace-Formel: ${text(task.p)}. Dann 1 − P(E).`;
  }
  const m = task.mind;
  if (m === undefined) return "";
  return `„Mindestens einmal“ hat viele Pfade. Das Gegenereignis „${m.gegenName}“ hat nur einen Pfad. Rechne P(${gegenKurz(m)}) und dann 1 − P(${gegenKurz(m)}).`;
}

/** Warum eine Antwort falsch ist. */
export function grund(task: GegenAufgabe, answer: string): string {
  const u = urteil(answer, task.loesung);
  if (u === "richtig" || u === "gerundet") return "";
  if (meldung(u) !== "") return meldung(u);
  if (trifft(answer, task.p)) {
    return task.mind === undefined
      ? "Das ist P(E). Gefragt ist das Gegenereignis: 1 − P(E)."
      : `Das ist P(${gegenKurz(task.mind)}) – das Gegenereignis. Jetzt noch 1 − diesen Wert.`;
  }
  return tipp(task);
}

/** Die Meldung der App zu einer falschen Antwort (Vertrag der Übung): grund. */
export const reason = (task: GegenAufgabe, answer: string, _props?: unknown, _lang?: string): string =>
  grund(task, answer);

/** Die Antwort jedes typischen Fehlers aus about.mistakes: P(E); bei „mindestens einmal“ P(kein Mal). */
export function mistakes(task: GegenAufgabe, _props?: unknown): (string | undefined)[] {
  const p = text(task.p);
  return [task.art === "mindestens" ? undefined : p, task.art === "mindestens" ? p : undefined].map((a) =>
    a === undefined || check(task, a) ? undefined : a,
  );
}

/** Die Aufgabe, wie das Kind sie liest, mit {Aufgabe}, {Bild} und {Feld}. */
export const template = (_props?: unknown, _lang?: string): string => "{Aufgabe} {Bild} Das Kind tippt {Feld} …";

/** Was eine Aufgabe festlegt: ihr Text, was das Bild zeigt, und das Feld. */
export const params = (task: GegenAufgabe, _props?: unknown, _lang?: string): Record<string, string> => ({
  Aufgabe: task.text,
  Bild: bildText(task),
  Feld: task.label,
});

/** Eine Antwort als Text, wie das Kind sie getippt hat. */
export const show = (answer: string, _task?: GegenAufgabe, _props?: unknown, _lang?: string): string => answer.trim();

export function weg(task: GegenAufgabe): string[] {
  const p = text(task.p);
  const l = text(task.loesung);
  if (task.art === "direkt") return [`P(nicht E) = 1 − P(E) = 1 − ${p} = ${l}`];
  if (task.art === "einfach") {
    const n = task.menge?.elemente.length ?? 0;
    const e = task.menge?.elemente.filter((x) => x.guenstig).length ?? 0;
    return [
      `P(E) = ${e}/${n}${`${e}/${n}` === p ? "" : ` = ${p}`}`,
      `P(nicht E) = 1 − ${p} = ${l}`,
      `Kontrolle: ${n - e} von ${n} Ergebnissen sind „nicht E“.`,
    ];
  }
  const m = task.mind;
  if (m === undefined) return [];
  return [
    `Gegenereignis: ${m.gegenName}.`,
    `P(${gegenKurz(m)}) = ${m.term} = ${p}`,
    `P(mindestens einmal ${m.name}) = 1 − ${p} = ${l}`,
  ];
}

/** Was das Bild der Aufgabe zeigt, in Worten. */
export function bildText(task: GegenAufgabe): string {
  if (task.art === "direkt") {
    const ende = endStellen(task.p) <= 3 ? "" : " (ungefähr)";
    return `Das Bild zeigt einen Streifen: Der Teil für E ist ${text(task.p)} des Ganzen${ende}, der Rest ist „nicht E“.`;
  }
  if (task.art === "einfach")
    return `Das Bild zeigt alle ${task.menge?.elemente.length ?? 0} möglichen Ergebnisse; du kannst die von E anklicken.`;
  return `Das Bild zeigt den Baum; orange ist der einzige Pfad des Gegenereignisses „${task.mind?.gegenName ?? ""}“.`;
}

export function describe(task: GegenAufgabe, _props?: unknown, _lang?: string): { task: string; solution: string } {
  return { task: `${task.text}\n\n${bildText(task)}\n\n${task.label} …`, solution: weg(task).join("\n\n") };
}

export const about = {
  task: "Eine Gegenwahrscheinlichkeit berechnen: P(nicht E) aus P(E), das Gegenereignis eines Laplace-Ereignisses, oder „mindestens einmal“ über „kein einziges Mal“.",
  answer:
    "Eine Wahrscheinlichkeit ins Feld getippt, dann „Prüfen“ unter der Aufgabe: Bruch, Dezimalzahl auf mindestens zwei Nachkommastellen, Prozent oder ein Term wie 1-(5/6)^3. Nach einer falschen Antwort gibt es „Lösung zeigen“ mit dem Rechenweg.",
  correct: "1 − P(E), exakt oder richtig gerundet; bei „mindestens einmal“ 1 − P(kein einziges Mal).",
  mistakes: [
    "P(E) statt 1 − P(E) angegeben.",
    "Bei „mindestens einmal“ nur P(kein Mal) ausgerechnet und nicht von 1 abgezogen.",
  ],
};
