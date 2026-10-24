// Das Modell des Kapitels Zufall, rein und ohne DOM: ein Zufall aus einem Seed (mulberry32), die Zufallsversuche (Urne,
// Münze, Würfel „6 / keine 6“, Glücksrad), der Baum eines mehrstufigen Versuchs mit und ohne Zurücklegen und die
// Ereignisse in Worten (genau einmal, mindestens einmal, kein Mal, alle gleich, eine Reihenfolge).
// Eine Urne schreibt sich kurz „3r2b1g“: 3 rote, 2 blaue, 1 gelbe Kugel. Ein Pfad ist die Folge der Ergebnis-Kürzel
// („rb“: erst rot, dann blau); er ist zugleich die Id seines Knotens im Baum.
import { type Bruch, bruch, EINS, mal, summe } from "./ZufallBruch.ts";

// --- Zufall ---------------------------------------------------------------------------------------------------------

export interface Zufall {
  ganzzahl(min: number, max: number): number;
  wahl<T>(liste: readonly T[]): T;
  mischen<T>(liste: readonly T[]): T[];
}

/** Ein deterministischer Zufall: derselbe Seed gibt dieselbe Folge. */
export function zufallAus(seed: number): Zufall {
  let a = Math.trunc(seed) >>> 0;
  const naechste = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const wahl = <T>(liste: readonly T[]): T => {
    const x = liste[Math.floor(naechste() * liste.length)];
    if (x === undefined) throw new RangeError("Wahl aus einer leeren Liste");
    return x;
  };
  return {
    ganzzahl: (min, max) => min + Math.floor(naechste() * (max - min + 1)),
    wahl,
    mischen<T>(liste: readonly T[]): T[] {
      const kopie = [...liste];
      for (let i = kopie.length - 1; i > 0; i--) {
        const j = Math.floor(naechste() * (i + 1));
        [kopie[i], kopie[j]] = [kopie[j] as T, kopie[i] as T];
      }
      return kopie;
    },
  };
}

// --- Versuche -------------------------------------------------------------------------------------------------------

export const FARBEN: Readonly<Record<string, { name: string; hex: string }>> = {
  r: { name: "rot", hex: "#c62828" },
  b: { name: "blau", hex: "#1565c0" },
  g: { name: "gelb", hex: "#f9a825" },
  n: { name: "grün", hex: "#2e7d32" },
  s: { name: "schwarz", hex: "#212121" },
  w: { name: "weiß", hex: "#fafafa" },
};

/** Ein Ergebnis eines Versuchs: anzahl gleich wahrscheinliche Elementarergebnisse (Kugeln, Felder, Seiten). */
export interface Ergebnis {
  id: string;
  name: string;
  farbe: string;
  anzahl: number;
}

export type Versuchsart = "urne" | "muenze" | "wuerfel" | "gluecksrad";

export interface Versuch {
  art: Versuchsart;
  ergebnisse: Ergebnis[];
}

/** Die Urnen, aus denen der Zufall wählt. */
export const URNEN = ["3r2b1g", "2r3b", "4r1b", "2r2b2g", "5r3b", "1r2b3g", "3r3b", "2r1b1n", "4r2g"];

/** „3r2b1g“ → die Ergebnisse; undefined, wenn die Angabe keine Urne ist. */
export function parseUrne(spec: string): Ergebnis[] | undefined {
  const s = spec.trim().toLowerCase();
  if (!/^(\d+[a-z])+$/.test(s)) return undefined;
  const liste: Ergebnis[] = [];
  for (const [, anzahl = "0", id = ""] of s.matchAll(/(\d+)([a-z])/g)) {
    const farbe = FARBEN[id];
    if (farbe === undefined || Number(anzahl) === 0) return undefined;
    liste.push({ id, name: farbe.name, farbe: farbe.hex, anzahl: Number(anzahl) });
  }
  return liste;
}

export function urne(spec: string): Versuch {
  return { art: "urne", ergebnisse: parseUrne(spec) ?? parseUrne("3r2b1g") ?? [] };
}

export function gluecksrad(spec: string): Versuch {
  return { ...urne(spec), art: "gluecksrad" };
}

export const muenze = (): Versuch => ({
  art: "muenze",
  ergebnisse: [
    { id: "k", name: "Kopf", farbe: "#eceff1", anzahl: 1 },
    { id: "z", name: "Zahl", farbe: "#eceff1", anzahl: 1 },
  ],
});

/** Ein Würfel, bei dem nur „6“ oder „keine 6“ zählt. */
export const wuerfelSechs = (): Versuch => ({
  art: "wuerfel",
  ergebnisse: [
    { id: "s", name: "6", farbe: "#eceff1", anzahl: 1 },
    { id: "k", name: "keine 6", farbe: "#eceff1", anzahl: 5 },
  ],
});

/** Der Versuch zu einer Angabe: experiment und urne. */
export function versuchAus(experiment: Versuchsart | undefined, spec: string | undefined): Versuch {
  if (experiment === "muenze") return muenze();
  if (experiment === "wuerfel") return wuerfelSechs();
  if (experiment === "gluecksrad") return gluecksrad(spec ?? "2r1b1g");
  return urne(spec ?? "3r2b1g");
}

export const gesamt = (v: Versuch): number => v.ergebnisse.reduce((s, e) => s + e.anzahl, 0);
export const ergebnis = (v: Versuch, id: string): Ergebnis | undefined => v.ergebnisse.find((e) => e.id === id);
export const nameVon = (v: Versuch, id: string): string => ergebnis(v, id)?.name ?? id;
export const ohneMoeglich = (v: Versuch): boolean => v.art === "urne";
export const urnenSpec = (v: Versuch): string => v.ergebnisse.map((e) => `${e.anzahl}${e.id}`).join("");

/** Die Wahrscheinlichkeit eines Ergebnisses beim ersten Zug. */
export const wahrscheinlichkeit = (v: Versuch, id: string): Bruch => bruch(ergebnis(v, id)?.anzahl ?? 0, gesamt(v));

/** Ziehen ohne Zurücklegen: derselbe Versuch mit einer Kugel `id` weniger. */
export function entferne(v: Versuch, id: string): Versuch {
  const ergebnisse = v.ergebnisse
    .map((e) => (e.id === id ? { ...e, anzahl: e.anzahl - 1 } : { ...e }))
    .filter((e) => e.anzahl > 0);
  return { ...v, ergebnisse };
}

/** Nur noch zwei Ergebnisse: `id` und „nicht …“ (die übrigen zusammen, Kürzel x), z. B. „gelb / nicht gelb“. */
export function nurErgebnisUndRest(v: Versuch, id: string): Versuch {
  const e = ergebnis(v, id);
  const rest = gesamt(v) - (e?.anzahl ?? 0);
  if (e === undefined || v.ergebnisse.length <= 2 || rest === 0) return v;
  return { ...v, ergebnisse: [{ ...e }, { id: "x", name: `nicht ${e.name}`, farbe: "#cfd8dc", anzahl: rest }] };
}

const adjektiv = (e: Ergebnis) => `${e.anzahl} ${e.name}e`;

/** „3 rote, 2 blaue und 1 gelbe Kugel“; bei Einzahl und Mehrzahl zweier Farben: „4 rote Kugeln und 1 blaue Kugel“. */
export function kugelListe(ergebnisse: readonly Ergebnis[]): string {
  const nomen = (e: Ergebnis) => (e.anzahl === 1 ? "Kugel" : "Kugeln");
  const liste = ergebnisse.filter((e) => e.anzahl > 0);
  const letzte = liste[liste.length - 1];
  const erste = liste[0];
  if (letzte === undefined || erste === undefined) return "keine Kugel";
  if (liste.length === 2 && (erste.anzahl === 1) !== (letzte.anzahl === 1)) {
    return liste.map((e) => `${adjektiv(e)} ${nomen(e)}`).join(" und ");
  }
  const vorne = liste.slice(0, -1).map(adjektiv).join(", ");
  return `${vorne ? `${vorne} und ` : ""}${adjektiv(letzte)} ${nomen(letzte)}`;
}

/** Name einer Stufe: Aus der Urne wird gezogen, Münze und Würfel werden geworfen, das Glücksrad gedreht. */
export const stufenWort = (v: Versuch): string =>
  v.art === "urne" ? "Zug" : v.art === "gluecksrad" ? "Drehung" : "Wurf";

export function versuchText(v: Versuch, zuege: number, mit: boolean): string {
  const male = zuege === 2 ? "zweimal" : `${zuege}-mal`;
  if (v.art === "urne") {
    return `In einer Urne liegen ${kugelListe(v.ergebnisse)}. Du ziehst ${male} nacheinander ${mit ? "mit" : "ohne"} Zurücklegen.`;
  }
  if (v.art === "muenze") return `Du wirfst eine Münze ${male}.`;
  return `Du würfelst ${male}. Es zählt nur: 6 oder keine 6.`;
}

// --- Baum -----------------------------------------------------------------------------------------------------------

/** Ein Knoten des Baums; seine id ist sein Pfad („rb“), die Wurzel hat die id "". */
export interface Knoten {
  id: string;
  stufe: number;
  ergebnis: string;
  name: string;
  farbe: string;
  anzahl: number;
  gesamt: number;
  w: Bruch;
  pw: Bruch;
  kinder: Knoten[];
}

export interface Baum {
  versuch: Versuch;
  zuege: number;
  mit: boolean;
  wurzel: Knoten;
}

function kinderVon(v: Versuch, stufe: number, zuege: number, mit: boolean, pfad: string, pw: Bruch): Knoten[] {
  if (stufe >= zuege) return [];
  const alle = gesamt(v);
  return v.ergebnisse.map((e) => {
    const w = bruch(e.anzahl, alle);
    const id = pfad + e.id;
    const p = mal(pw, w);
    const danach = mit ? v : entferne(v, e.id);
    return {
      id,
      stufe: stufe + 1,
      ergebnis: e.id,
      name: e.name,
      farbe: e.farbe,
      anzahl: e.anzahl,
      gesamt: alle,
      w,
      pw: p,
      kinder: kinderVon(danach, stufe + 1, zuege, mit, id, p),
    };
  });
}

export function baueBaum(v: Versuch, zuege: number, mit: boolean): Baum {
  const mitWirklich = mit || !ohneMoeglich(v);
  const wurzel: Knoten = {
    id: "",
    stufe: 0,
    ergebnis: "",
    name: "Start",
    farbe: "",
    anzahl: 1,
    gesamt: 1,
    w: EINS,
    pw: EINS,
    kinder: kinderVon(v, 0, zuege, mitWirklich, "", EINS),
  };
  return { versuch: v, zuege, mit: mitWirklich, wurzel };
}

/** Alle Knoten außer der Wurzel, von oben nach unten (Tiefensuche). */
export function alleKnoten(b: Baum): Knoten[] {
  const liste: Knoten[] = [];
  const gehe = (k: Knoten) => {
    if (k !== b.wurzel) liste.push(k);
    k.kinder.forEach(gehe);
  };
  gehe(b.wurzel);
  return liste;
}

export const blaetter = (b: Baum): Knoten[] => alleKnoten(b).filter((k) => k.kinder.length === 0);

export function findeKnoten(b: Baum, pfad: string): Knoten | undefined {
  let k: Knoten | undefined = b.wurzel;
  for (const id of pfad) k = k?.kinder.find((c) => c.ergebnis === id);
  return k;
}

/** Die Zweige entlang eines Pfades, vom Start bis zum Ende. */
export function zweigeEntlang(b: Baum, pfad: string): Knoten[] {
  const liste: Knoten[] = [];
  for (let i = 1; i <= pfad.length; i++) {
    const k = findeKnoten(b, pfad.slice(0, i));
    if (k !== undefined) liste.push(k);
  }
  return liste;
}

export const zweigText = (k: Knoten): string => `${k.anzahl}/${k.gesamt}`;
export const pfadTerm = (b: Baum, pfad: string): string => zweigeEntlang(b, pfad).map(zweigText).join(" · ");
export const pfadName = (b: Baum, pfad: string): string =>
  pfad
    .split("")
    .map((id) => nameVon(b.versuch, id))
    .join("-");

// --- Ereignisse -----------------------------------------------------------------------------------------------------

/** Ein Ereignis in Worten; code nach der Grammatik der alten App (genau1r, mind1r, keinr, allegleich, rb …). */
export interface Ereignis {
  code: string;
  name: string;
}

const MAL = ["kein Mal", "einmal", "zweimal", "dreimal"];
const zaehle = (pfad: string, id: string) => pfad.split("").filter((x) => x === id).length;

/** Name eines Ereignisses; undefined, wenn der Code zum Versuch nicht passt. */
export function ereignisName(v: Versuch, zuege: number, code: string): string | undefined {
  const ids = v.ergebnisse.map((e) => e.id);
  if (code === "allegleich") return zuege === 2 ? "beide gleich" : "alle gleich";
  if (code === "verschieden") return zuege === 2 ? "beide verschieden" : "alle verschieden";
  const m = /^(genau|mind)(\d)([a-z0-9])$/.exec(code);
  if (m !== null) {
    const [, art = "", n = "0", id = ""] = m;
    if (!ids.includes(id) || Number(n) > zuege) return undefined;
    return `${art === "genau" ? "genau" : "mindestens"} ${MAL[Number(n)] ?? `${n}-mal`} ${nameVon(v, id)}`;
  }
  const kein = /^kein([a-z0-9])$/.exec(code);
  if (kein !== null && ids.includes(kein[1] ?? "")) {
    const id = kein[1] ?? "";
    const andere = v.ergebnisse.filter((e) => e.id !== id);
    const name = nameVon(v, id);
    // „kein einziges Mal keine 6“ wäre doppelt verneint: positiv heißt es „jedes Mal eine 6“.
    if (name.startsWith("keine ") && andere.length === 1) return `jedes Mal eine ${andere[0]?.name ?? ""}`;
    return `kein einziges Mal ${name}`;
  }
  if (code.length === zuege && code.split("").every((id) => ids.includes(id))) {
    const namen = code.split("").map((id) => nameVon(v, id));
    if (namen.length === 2) return `erst ${namen[0] ?? ""}, dann ${namen[1] ?? ""}`;
    return namen
      .map((n, i) => (i === 0 ? `erst ${n}` : i === namen.length - 1 ? `zuletzt ${n}` : `dann ${n}`))
      .join(", ");
  }
  return undefined;
}

/** Ob ein Pfad zum Ereignis gehört. */
export function gehoertZu(code: string, pfad: string): boolean {
  if (code === "allegleich") return pfad.split("").every((x) => x === pfad[0]);
  if (code === "verschieden") return new Set(pfad).size === pfad.length;
  const m = /^(genau|mind)(\d)([a-z0-9])$/.exec(code);
  if (m !== null) {
    const n = zaehle(pfad, m[3] ?? "");
    return m[1] === "genau" ? n === Number(m[2]) : n >= Number(m[2]);
  }
  const kein = /^kein([a-z0-9])$/.exec(code);
  if (kein !== null) return zaehle(pfad, kein[1] ?? "") === 0;
  return pfad === code;
}

export const ereignisPfade = (b: Baum, code: string): Knoten[] => blaetter(b).filter((k) => gehoertZu(code, k.id));
export const ereignisW = (b: Baum, code: string): Bruch => summe(ereignisPfade(b, code).map((k) => k.pw));

/** Die Ereignisse, die eine Aufgabe zu einem Versuch stellen kann. */
export function moeglicheEreignisse(v: Versuch, zuege: number): Ereignis[] {
  const codes = v.ergebnisse.flatMap((e) => [`genau1${e.id}`, `mind1${e.id}`, `kein${e.id}`, `genau2${e.id}`]);
  codes.push("allegleich", "verschieden");
  return codes.flatMap((code) => {
    const name = ereignisName(v, zuege, code);
    return name === undefined ? [] : [{ code, name }];
  });
}

/** Ein zufälliger Versuch für eine Baum-Aufgabe; drei Stufen nur bei zwei Ergebnissen (sonst wird der Baum zu groß). */
export function waehleVersuch(z: Zufall, zuegeFest?: number): { versuch: Versuch; zuege: number; mit: boolean } {
  const art = z.wahl(["urne", "urne", "muenze", "wuerfel"] as const);
  const versuch = art === "urne" ? urne(z.wahl(URNEN)) : art === "muenze" ? muenze() : wuerfelSechs();
  const zweiErgebnisse = versuch.ergebnisse.length === 2;
  const zuege = zuegeFest ?? (zweiErgebnisse ? z.wahl([2, 2, 3]) : 2);
  const mit = ohneMoeglich(versuch) ? z.wahl([true, false]) : true;
  return { versuch, zuege, mit };
}
