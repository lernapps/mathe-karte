// Die Ergebnismenge eines einstufigen Laplace-Versuchs und ihre Lage im Bild (ZufallMenge.vue), rein und ohne DOM:
// Würfel, Urne, Glücksrad, Skatkarten, Lose, zwei Würfel. Jedes Element ist ein gleich wahrscheinliches Ergebnis;
// guenstig heißt, es gehört zum Ereignis.
import { type Zufall, FARBEN, URNEN, kugelListe, parseUrne } from "./ZufallModell.ts";

export type Mengenart = "wuerfel" | "urne" | "gluecksrad" | "karten" | "lose" | "zweiwuerfel";

export interface Element {
  id: string;
  label: string;
  name: string;
  farbe: string;
  guenstig: boolean;
}

export interface Menge {
  art: Mengenart;
  kontext: string;
  ereignisName: string;
  /** Das Gegenereignis als Satzteil wie ereignisName und als Kurzname. */
  gegenFrage: string;
  gegenKurz: string;
  elemente: Element[];
  /** Wie viele Farben die Urne hat (für den Fehler „Farben gezählt“); 0 sonst. */
  farben: number;
}

interface Ereignisvorlage {
  name: string;
  test: (x: number, y: number) => boolean;
  gegen?: [string, string];
}

const PRIM = [2, 3, 5];
const WUERFEL: Readonly<Record<string, Ereignisvorlage>> = {
  gerade: { name: "eine gerade Zahl", test: (n) => n % 2 === 0, gegen: ["eine ungerade Zahl", "ungerade Zahl"] },
  ungerade: { name: "eine ungerade Zahl", test: (n) => n % 2 === 1, gegen: ["eine gerade Zahl", "gerade Zahl"] },
  mind5: { name: "mindestens eine 5", test: (n) => n >= 5, gegen: ["höchstens eine 4", "Zahl höchstens 4"] },
  hoechstens2: { name: "höchstens eine 2", test: (n) => n <= 2, gegen: ["mindestens eine 3", "Zahl mindestens 3"] },
  sechs: { name: "eine 6", test: (n) => n === 6 },
  keine6: { name: "keine 6", test: (n) => n !== 6, gegen: ["eine 6", "eine 6"] },
  prim: { name: "eine Primzahl", test: (n) => PRIM.includes(n) },
  groesser3: { name: "eine Zahl größer als 3", test: (n) => n > 3, gegen: ["höchstens eine 3", "Zahl höchstens 3"] },
};

const KARTEN_FARBEN: readonly [string, string, string][] = [
  ["Kreuz", "♣", "#212121"],
  ["Pik", "♠", "#212121"],
  ["Herz", "♥", "#c62828"],
  ["Karo", "♦", "#c62828"],
];
const WERTE = ["7", "8", "9", "10", "B", "D", "K", "A"];
const WERT_NAMEN: Readonly<Record<string, string>> = { B: "Bube", D: "Dame", K: "König", A: "Ass" };
// x: Index der Farbe in KARTEN_FARBEN, y: Index des Werts in WERTE
const KARTEN: Readonly<Record<string, Ereignisvorlage>> = {
  herz: { name: "eine Herz-Karte", test: (f) => f === 2 },
  pik: { name: "eine Pik-Karte", test: (f) => f === 1 },
  bube: { name: "einen Buben", test: (_f, w) => w === 4, gegen: ["keinen Buben", "kein Bube"] },
  ass: { name: "ein Ass", test: (_f, w) => w === 7 },
  bild: { name: "eine Bildkarte (Bube, Dame oder König)", test: (_f, w) => w >= 4 && w <= 6 },
  rot: { name: "eine rote Karte (Herz oder Karo)", test: (f) => f >= 2 },
};

const ZWEI: Readonly<Record<string, Ereignisvorlage>> = {
  pasch: { name: "einen Pasch (beide Zahlen gleich)", test: (a, b) => a === b },
  ...Object.fromEntries(
    [4, 5, 6, 7, 8, 9, 10].map((s) => [
      `summe${s}`,
      {
        name: `die Augensumme ${s}`,
        test: (a: number, b: number) => a + b === s,
        gegen: [`eine andere Augensumme als ${s}`, `andere Augensumme als ${s}`] as [string, string],
      },
    ]),
  ),
};

/** „eine Herz-Karte“ → „keine Herz-Karte“, „einen Gewinn“ → „keinen Gewinn“ / „kein Gewinn“. */
function gegen(v: Ereignisvorlage): [string, string] {
  if (v.gegen !== undefined) return v.gegen;
  const frage = v.name.replace(/^(ein|eine|einen) /, "k$1 ");
  return [frage, frage.replace(/^keinen /, "kein ")];
}

function menge(art: Mengenart, kontext: string, v: Ereignisvorlage, elemente: Element[], farben = 0): Menge {
  const [gegenFrage, gegenKurz] = gegen(v);
  return { art, kontext, ereignisName: v.name, gegenFrage, gegenKurz, elemente, farben };
}

export function mengeWuerfel(code: string): Menge {
  const v = WUERFEL[code] ?? (WUERFEL["gerade"] as Ereignisvorlage);
  const elemente = [1, 2, 3, 4, 5, 6].map((n) => ({
    id: String(n),
    label: String(n),
    name: `Würfelseite ${n}`,
    farbe: "#ffffff",
    guenstig: v.test(n, 0),
  }));
  return menge("wuerfel", "Du würfelst einmal mit einem normalen Würfel.", v, elemente);
}

/** Urne oder Glücksrad: jede Kugel, jedes Feld ist ein Ergebnis; das Ereignis ist eine Farbe. */
export function mengeFarben(art: "urne" | "gluecksrad", spec: string, farbe: string): Menge {
  const ergebnisse = parseUrne(spec) ?? parseUrne("3r2b1g") ?? [];
  const ev = ergebnisse.find((e) => e.id === farbe) ?? ergebnisse[0];
  const name = FARBEN[ev?.id ?? "r"]?.name ?? "rot";
  const alle = ergebnisse.reduce((s, e) => s + e.anzahl, 0);
  const felder = ergebnisse
    .map((e) => `${e.anzahl} ${e.name}`)
    .join(", ")
    .replace(/, ([^,]*)$/, " und $1");
  const kontext =
    art === "urne"
      ? `In einer Urne liegen ${kugelListe(ergebnisse)}. Du ziehst blind eine Kugel.`
      : `Ein Glücksrad hat ${alle} gleich große Felder: ${felder}. Du drehst einmal.`;
  const elemente = ergebnisse.flatMap((e) =>
    Array.from({ length: e.anzahl }, (_, i) => ({
      id: `${e.id}${i + 1}`,
      label: e.name,
      name: `${e.name}${art === "urne" ? "e Kugel" : "es Feld"} ${i + 1}`,
      farbe: e.farbe,
      guenstig: e.id === ev?.id,
    })),
  );
  const ereignis = art === "urne" ? `eine ${name}e Kugel` : `ein ${name}es Feld`;
  return menge(art, kontext, { name: ereignis, test: () => false }, elemente, art === "urne" ? ergebnisse.length : 0);
}

export function mengeKarten(code: string): Menge {
  const v = KARTEN[code] ?? (KARTEN["herz"] as Ereignisvorlage);
  const elemente = KARTEN_FARBEN.flatMap(([farbe, symbol, hex], f) =>
    WERTE.map((wert, w) => ({
      id: `${farbe}${wert}`,
      label: `${symbol}${wert}`,
      name: WERT_NAMEN[wert] === undefined ? `${farbe} ${wert}` : `${farbe} ${WERT_NAMEN[wert]}, ${wert}`,
      farbe: hex,
      guenstig: v.test(f, w),
    })),
  );
  const kontext =
    "Ein Skatspiel hat 32 Karten: je 8 Karten in Kreuz, Pik, Herz und Karo (7, 8, 9, 10, Bube, Dame, König, Ass). Du ziehst eine Karte.";
  return menge("karten", kontext, v, elemente);
}

export function mengeLose(lose: number, gewinne: number): Menge {
  const elemente = Array.from({ length: lose }, (_, i) => ({
    id: `l${i + 1}`,
    label: String(i + 1),
    name: `Los ${i + 1}`,
    farbe: "#1a1a1a",
    guenstig: i < gewinne,
  }));
  const kontext = `Beim Klassenfest gibt es ${lose} Lose, davon sind ${gewinne} Gewinne. Du kaufst ein Los.`;
  return menge("lose", kontext, { name: "einen Gewinn", test: () => false }, elemente);
}

export function mengeZweiWuerfel(code: string): Menge {
  const v = ZWEI[code] ?? (ZWEI["summe7"] as Ereignisvorlage);
  const elemente: Element[] = [];
  for (let a = 1; a <= 6; a++) {
    for (let b = 1; b <= 6; b++) {
      elemente.push({
        id: `${a}${b}`,
        label: `${a}|${b}`,
        name: `rot ${a}, blau ${b}`,
        farbe: "#1a1a1a",
        guenstig: v.test(a, b),
      });
    }
  }
  const kontext =
    "Du würfelst mit zwei Würfeln (einem roten und einem blauen). Jedes Paar ist ein eigenes Ergebnis – es gibt 36.";
  return menge("zweiwuerfel", kontext, v, elemente);
}

/** Eine zufällige Ergebnismenge aus allen sechs Arten. */
export function waehleMenge(z: Zufall): Menge {
  const art = z.wahl(["wuerfel", "urne", "gluecksrad", "karten", "lose", "zweiwuerfel"] as const);
  if (art === "wuerfel") return mengeWuerfel(z.wahl(Object.keys(WUERFEL)));
  if (art === "karten") return mengeKarten(z.wahl(Object.keys(KARTEN)));
  if (art === "zweiwuerfel") return mengeZweiWuerfel(z.wahl(Object.keys(ZWEI)));
  if (art === "lose") {
    const lose = z.wahl([10, 20, 25, 50]);
    return mengeLose(lose, z.ganzzahl(1, Math.floor(lose / 2)));
  }
  const spec = z.wahl(URNEN);
  const farben = (parseUrne(spec) ?? []).map((e) => e.id);
  return mengeFarben(art, spec, z.wahl(farben));
}

/** Frage nach der Wahrscheinlichkeit eines Ereignisses (Satzteil wie ereignisName). */
export function frage(m: Menge, ereignis: string): string {
  const verb =
    m.art === "wuerfel" || m.art === "zweiwuerfel" ? "würfelst" : m.art === "gluecksrad" ? "drehst" : "ziehst";
  return `Wie groß ist die Wahrscheinlichkeit, dass du ${ereignis} ${verb}?`;
}

// --- Lage im Bild ---------------------------------------------------------------------------------------------------

export type Form = "wuerfel" | "kugel" | "sektor" | "feld";

export interface ElementBild {
  id: string;
  name: string;
  form: Form;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Pfad eines Glücksradfelds; leer sonst. */
  d: string;
  label: string;
  farbe: string;
  schrift: string;
  augen: [number, number][];
  guenstig: boolean;
}

/**
 * Der Name eines wählbaren Elements für Screenreader. Zeigt ein Feld Text (Würfelpaar „1|1“), beginnt der Name damit:
 * Wer per Sprache steuert, sagt, was er sieht (WCAG 2.5.3, axe label-content-name-mismatch).
 */
export function knopfName(e: Pick<ElementBild, "form" | "label" | "name">): string {
  return e.form === "feld" && e.label !== e.name ? `${e.label}: ${e.name}` : e.name;
}

export interface MengeBild {
  breite: number;
  hoehe: number;
  elemente: ElementBild[];
}

const AUGEN: Readonly<Record<number, [number, number][]>> = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
  5: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
  ],
  6: [
    [0, 0],
    [0, 1],
    [0, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
};

/** Wie viele Spalten ein Raster bekommt: die erste aus `wunsch`, die in `max` passt. */
const spalten = (wunsch: readonly number[], breiteBei: (s: number) => number, max: number) =>
  wunsch.find((s) => breiteBei(s) <= max) ?? wunsch[wunsch.length - 1] ?? 1;

function raster(m: Menge, wunsch: readonly number[], w: number, h: number, form: Form, max: number): MengeBild {
  const abstand = form === "kugel" ? 6 : 4;
  const s = spalten(wunsch, (k) => k * (w + abstand) + abstand, max);
  const elemente = m.elemente.map((e, i): ElementBild => {
    const x = abstand + (i % s) * (w + abstand);
    const y = abstand + Math.floor(i / s) * (h + abstand);
    const augen =
      form === "wuerfel"
        ? (AUGEN[Number(e.label)] ?? []).map(([r, c]): [number, number] => [
            x + (w / 4) * (c + 1),
            y + (h / 4) * (r + 1),
          ])
        : [];
    return {
      id: e.id,
      name: e.name,
      form,
      x,
      y,
      w,
      h,
      d: "",
      label: e.label,
      farbe: e.farbe,
      schrift: form === "kugel" ? "" : e.farbe,
      augen,
      guenstig: e.guenstig,
    };
  });
  return {
    breite: s * (w + abstand) + abstand,
    hoehe: Math.ceil(m.elemente.length / s) * (h + abstand) + abstand,
    elemente,
  };
}

function rad(m: Menge): MengeBild {
  const n = m.elemente.length;
  const R = 70;
  const [mx, my] = [80, 88];
  const elemente = m.elemente.map((e, i): ElementBild => {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const p = (a: number, r = R) => `${(mx + r * Math.cos(a)).toFixed(2)} ${(my + r * Math.sin(a)).toFixed(2)}`;
    const mitte = (a0 + a1) / 2;
    const [hx, hy] = p(mitte, 0.6 * R)
      .split(" ")
      .map(Number) as [number, number];
    return {
      id: e.id,
      name: e.name,
      form: "sektor",
      x: hx,
      y: hy,
      w: 0,
      h: 0,
      d: `M${mx} ${my} L${p(a0)} A${R} ${R} 0 0 1 ${p(a1)} Z`,
      label: e.label,
      farbe: e.farbe,
      schrift: "",
      augen: [],
      guenstig: e.guenstig,
    };
  });
  return { breite: 160, hoehe: 168, elemente };
}

/** Die Lage der Ergebnismenge, höchstens `max` breit. */
export function mengeBild(m: Menge, max = 320): MengeBild {
  if (m.art === "wuerfel") return raster(m, [6, 3], 44, 44, "wuerfel", max);
  if (m.art === "urne")
    return raster(
      m,
      [8, 7, 6, 5, 4].map((s) => Math.min(s, m.elemente.length)),
      28,
      28,
      "kugel",
      max,
    );
  if (m.art === "gluecksrad") return rad(m);
  if (m.art === "karten") return raster(m, [8, 4], 34, 28, "feld", max);
  if (m.art === "lose") return raster(m, [10, 5], 28, 24, "feld", max);
  return raster(m, [6, 3], 44, 26, "feld", max);
}

export const MENGEN_TITEL: Readonly<Record<Mengenart, string>> = {
  wuerfel: "Die sechs Seiten des Würfels",
  urne: "Die Kugeln in der Urne",
  gluecksrad: "Das Glücksrad mit seinen Feldern",
  karten: "Die 32 Karten",
  lose: "Alle Lose",
  zweiwuerfel: "Alle 36 Würfelpaare (rot|blau)",
};
