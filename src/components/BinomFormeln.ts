// Die Aufgaben des Kapitels "Binomische Formeln", in denen du einen Term eingibst: Klammern multiplizieren, die drei
// binomischen Formeln und Binome rückwärts (faktorisieren, Lücke ergänzen). Je Art ein Generator mit Rechenweg,
// typischen Fehltermen samt Meldung; das Flächenbild zeichnet BinomBilder.ts. Reine Funktionen; aus js/aufgaben/*.js der alten Lern-App.
import {
  addiere,
  alsAnzeige,
  alsEingabe,
  betrag,
  glied,
  gliedAnzeige,
  hatVariable,
  mal,
  multipliziere,
  produkt,
  quadrat,
  quadratAnzeige,
  type Glied,
  type Polynom,
  type Schritt,
  type Zufall,
} from "./BinomTerm.ts";

export type { Schritt };

export type Art = "klammern" | "erste" | "zweite" | "dritte" | "rueckwaerts";
export const ARTEN: readonly Art[] = ["klammern", "erste", "zweite", "dritte", "rueckwaerts"];

/** Ein typischer Fehler: die Fehlterme (Eingabeform, bei einer Lücke Zahlen) und was dazu zu sagen ist. */
export interface Fehler {
  kandidaten: string[];
  meldung: string;
  /** Welcher typische Fehler aus about von BinomTermAufgabe.ts das ist (Index in about.mistakes); keiner, wenn leer. */
  nr?: number;
}

/** Feste Werte statt Zufall, für das Bild zum Beispiel. */
export interface Vorgaben {
  m?: number;
  n?: number;
  m1?: number;
  n1?: number;
  m2?: number;
  n2?: number;
  formel?: number;
}

export interface TermAufgabe {
  art: Art;
  /** Der Auftrag vor dem Term: "Multipliziere aus und fasse zusammen:". */
  frage: string;
  /** Der Term der Aufgabe, bei einer Lücke mit □. */
  term: string;
  /** Die Antwort ist eine Zahl (Lücke), sonst ein Term. */
  zahl: boolean;
  form: "ausmultipliziert" | "faktorisiert";
  /** Die Lösung in Eingabeform: "x^2+6x+9", "(x+3)^2" oder "10". */
  loesung: string;
  /** Die ganze Lösung zum Lesen: "(x + 3)² = x² + 6x + 9". */
  ergebnis: string;
  schritte: Schritt[];
  tipp: string;
  fehler: Fehler[];
  /** Was das Bild braucht. */
  p: Polynom;
  q: Polynom;
  formel: number;
  luecke: "" | "mitte" | "ende";
}

const schritt = (formel: string, vor = "", nach = ""): Schritt => [vor && `${vor} `, formel, nach && ` ${nach}`];
export const klammer = (p: Polynom): string => `(${alsAnzeige(p)})`;
const ein = (p: Polynom): string => `(${alsEingabe(p)})`;
const g = gliedAnzeige;
const ZWEITE: Record<string, string> = { x: "y", a: "b" };

// --- Klammer mal Klammer -----------------------------------------------------

/** Rechenweg-Zeile: "2x · x + 2x · 4 − 1 · x − 1 · 4". */
function produktZeile(p: Polynom, q: Polynom): string {
  return p
    .flatMap((a) => q.map((b) => [a, b] as const))
    .map(([a, b], i) => {
      const negativ = a.k * b.k < 0;
      const text = `${g(betrag(a))} · ${g(betrag(b))}`;
      if (i === 0) return negativ ? `−${text}` : text;
      return `${negativ ? " − " : " + "}${text}`;
    })
    .join("");
}

function klammern(z: Zufall, v: Vorgaben): TermAufgabe {
  const zahl = (m: number): number => z.ganzzahl(1, m === 1 ? 9 : 5);
  const m1 = v.m1 ?? z.wahl([1, 1, 1, 2, 3]);
  const n1 = v.n1 ?? zahl(m1);
  const m2 = v.m2 ?? z.wahl([1, 1, 1, 2, 3]);
  const n2 = v.n2 ?? zahl(m2);
  const vorzeichen = (): number => (v.m1 === undefined ? z.wahl([1, -1]) : 1);
  const p = [glied(m1, "x"), glied(vorzeichen() * n1)];
  const q = [glied(m2, "x"), glied(vorzeichen() * n2)];
  const teile = p.flatMap((a) => q.map((b) => produkt(a, b)));
  const ergebnis = multipliziere(p, q);
  const term = `${klammer(p)}${klammer(q)}`;
  const [a = glied(0), , , d = glied(0)] = teile;
  const vorzeichenFehler: string[] = [];
  for (let maske = 1; maske < 16; maske++) {
    const gedreht = teile.map((t, i) => (maske & (1 << i) ? mal(t, -1) : t));
    vorzeichenFehler.push(alsEingabe(addiere(gedreht, [])));
  }
  return {
    art: "klammern",
    frage: "Multipliziere aus und fasse zusammen:",
    term,
    zahl: false,
    form: "ausmultipliziert",
    loesung: alsEingabe(ergebnis),
    ergebnis: `${term} = ${alsAnzeige(ergebnis)}`,
    schritte: [
      schritt(`${term} = ${produktZeile(p, q)}`, "Vier Produkte:"),
      schritt(`= ${alsAnzeige(teile)}`, "Ausgerechnet:"),
      schritt(`= ${alsAnzeige(ergebnis)}`, "Zusammengefasst:"),
    ],
    tipp: "Jedes Glied der ersten Klammer mal jedes Glied der zweiten Klammer – das sind vier Produkte. Achte auf die Vorzeichen, dann fasse die Glieder mit x zusammen.",
    fehler: [
      {
        nr: 5,
        kandidaten: [alsEingabe([a, d]), alsEingabe([a, mal(d, -1)])],
        meldung:
          "Du hast nur Erstes mal Erstes und Letztes mal Letztes gerechnet. Es fehlen die gemischten Glieder: jedes Glied der einen Klammer mal jedes Glied der anderen – vier Produkte.",
      },
      {
        nr: 5,
        kandidaten: vorzeichenFehler,
        meldung:
          "Fast: Die Zahlen stimmen, aber ein Vorzeichen nicht. Plus mal Minus gibt Minus, Minus mal Minus gibt Plus.",
      },
    ],
    p,
    q,
    formel: 0,
    luecke: "",
  };
}

// --- Binome ------------------------------------------------------------------

interface Binom {
  u: Glied;
  v: Glied;
  m: number;
  n: number;
}

/** Ein Binom m·x ± n oder m·x ± n·y (Variablen x, y oder a, b); n ist nie gleich m, wenn b eine Variable ist. */
function waehleBinom(z: Zufall, vorgaben: Vorgaben): Binom {
  const fest = vorgaben.m !== undefined;
  const art = fest ? "zahl" : z.wahl(["zahl", "zahl", "variable"]);
  const variable = fest ? "x" : z.wahl(["x", "a"]);
  const m = vorgaben.m ?? (art === "zahl" ? z.wahl([1, 1, 2, 3]) : z.ganzzahl(1, 5));
  let n = vorgaben.n ?? z.ganzzahl(1, art === "zahl" && m === 1 ? 9 : 5);
  if (art === "variable" && n === m) n = (n % 5) + 1;
  const u = glied(m, variable);
  const v = art === "zahl" ? glied(n) : glied(n, ZWEITE[variable] ?? "y");
  return { u, v, m, n };
}

/** "Nicht quadriert": nur die Variable quadriert, die Zahl davor bleibt (3a statt (3a)² = 9a²; 2 statt 4). */
const nurVariableQuadriert = (a: Glied): Glied => ({
  k: Math.abs(a.k),
  e: Object.fromEntries(Object.entries(a.e).map(([n, e]) => [n, 2 * e])),
});

/** Fehlterme "Zahl davor nicht quadriert" zu u² + mitte ± v²: erstes, zweites oder beide Glieder falsch quadriert. */
function nichtQuadriert(u: Glied, v: Glied, mitte: Polynom, vorzeichenB: number): Fehler {
  const uFalsch = Math.abs(u.k) > 1 ? nurVariableQuadriert(u) : undefined;
  const vFalsch = Math.abs(v.k) > 1 ? mal(nurVariableQuadriert(v), vorzeichenB) : undefined;
  const uu = quadrat(u);
  const vv = mal(quadrat(v), vorzeichenB);
  const varianten: [Glied, Glied][] = [];
  if (uFalsch) varianten.push([uFalsch, vv]);
  if (vFalsch) varianten.push([uu, vFalsch]);
  if (uFalsch && vFalsch) varianten.push([uFalsch, vFalsch]);
  const teile = [u, v].filter((a) => Math.abs(a.k) > 1).map((a) => `${quadratAnzeige(a)} = ${g(quadrat(a))}`);
  return {
    nr: 4,
    kandidaten: varianten.map(([a, b]) => alsEingabe([a, ...mitte, b])),
    meldung: `Quadriere jedes Glied ganz – die Zahl davor auch: ${teile.join(", ")}.`,
  };
}

const glieder = (b: Binom): string => `a = ${g(b.u)}, b = ${g(b.v)}`;

/** "Quadrate: x² = x² und 9 = 3², also a = x, b = 3". */
const quadrateSchritt = (u: Glied, v: Glied): Schritt => [
  "Quadrate: ",
  `${g(quadrat(u))} = ${quadratAnzeige(u)}`,
  " und ",
  `${g(quadrat(v))} = ${quadratAnzeige(v)}`,
  ", also ",
  `a = ${g(u)}, b = ${g(v)}`,
];

function erste(z: Zufall, vorgaben: Vorgaben): TermAufgabe {
  const b = waehleBinom(z, vorgaben);
  const { u, v } = b;
  const term = `${klammer([u, v])}²`;
  const ab = produkt(u, v);
  const ergebnis = multipliziere([u, v], [u, v]);
  const [uu, vv] = [quadrat(u), quadrat(v)];
  return {
    art: "erste",
    frage: "Multipliziere mit der ersten binomischen Formel aus:",
    term,
    zahl: false,
    form: "ausmultipliziert",
    loesung: alsEingabe(ergebnis),
    ergebnis: `${term} = ${alsAnzeige(ergebnis)}`,
    schritte: [
      schritt(glieder(b), "Glieder:"),
      schritt(`${term} = ${quadratAnzeige(u)} + 2 · ${g(u)} · ${g(v)} + ${quadratAnzeige(v)}`, "Formel:"),
      schritt(`= ${alsAnzeige(ergebnis)}`, "Ausgerechnet:"),
    ],
    tipp: `Erstes Glied a = ${g(u)}, zweites Glied b = ${g(v)}. Rechne a², dann 2 · a · b, dann b².`,
    fehler: [
      {
        nr: 0,
        kandidaten: [alsEingabe([uu, vv])],
        meldung: `Da fehlt das Mittelglied 2ab. ${term} heißt ${klammer([u, v])} · ${klammer([u, v])} – das sind vier Produkte, nicht zwei.`,
      },
      {
        nr: 1,
        kandidaten: [alsEingabe([uu, ab, vv])],
        meldung: "Das Mittelglied kommt zweimal vor: a · b und b · a. Deshalb heißt es 2ab.",
      },
      nichtQuadriert(u, v, [mal(ab, 2)], 1),
    ],
    p: [u, v],
    q: [u, v],
    formel: 1,
    luecke: "",
  };
}

function zweite(z: Zufall, vorgaben: Vorgaben): TermAufgabe {
  const b = waehleBinom(z, vorgaben);
  const { u, v } = b;
  const minusV = mal(v, -1);
  const term = `${klammer([u, minusV])}²`;
  const ab = produkt(u, v);
  const ergebnis = multipliziere([u, minusV], [u, minusV]);
  const [uu, vv] = [quadrat(u), quadrat(v)];
  return {
    art: "zweite",
    frage: "Multipliziere mit der zweiten binomischen Formel aus:",
    term,
    zahl: false,
    form: "ausmultipliziert",
    loesung: alsEingabe(ergebnis),
    ergebnis: `${term} = ${alsAnzeige(ergebnis)}`,
    schritte: [
      schritt(glieder(b), "Glieder:"),
      schritt(`${term} = ${quadratAnzeige(u)} − 2 · ${g(u)} · ${g(v)} + ${quadratAnzeige(v)}`, "Formel:"),
      schritt(`= ${alsAnzeige(ergebnis)}`, "Ausgerechnet:"),
    ],
    tipp: `Erstes Glied a = ${g(u)}, zweites Glied b = ${g(v)}. Rechne a², dann − 2 · a · b, dann + b². Das b² ist immer plus.`,
    fehler: [
      {
        nr: 0,
        kandidaten: [alsEingabe([uu, mal(vv, -1)]), alsEingabe([uu, vv])],
        meldung: `Da fehlt das Mittelglied − 2ab. ${term} heißt ${klammer([u, minusV])} mal sich selbst – das sind vier Produkte, nicht zwei.`,
      },
      {
        nr: 2,
        kandidaten: [alsEingabe([uu, mal(ab, -2), mal(vv, -1)])],
        meldung: "Das letzte Glied ist (−b)² = (−b) · (−b). Minus mal Minus gibt Plus – also + b².",
      },
      {
        nr: 1,
        kandidaten: [alsEingabe([uu, mal(ab, -1), vv])],
        meldung: "Das Mittelglied kommt zweimal vor: a · (−b) und (−b) · a. Deshalb heißt es − 2ab.",
      },
      {
        nr: 2,
        kandidaten: [alsEingabe([uu, mal(ab, 2), vv])],
        meldung: "Das ist die erste Formel. Bei (a − b)² ist das Mittelglied negativ: − 2ab.",
      },
      nichtQuadriert(u, v, [mal(ab, -2)], 1),
    ],
    p: [u, minusV],
    q: [u, minusV],
    formel: 2,
    luecke: "",
  };
}

function dritte(z: Zufall, vorgaben: Vorgaben): TermAufgabe {
  const b = waehleBinom(z, vorgaben);
  const { u, v } = b;
  const minusV = mal(v, -1);
  const plusMinus = vorgaben.m !== undefined || z.wahl([true, false]);
  const [p, q] = plusMinus
    ? [
        [u, v],
        [u, minusV],
      ]
    : [
        [u, minusV],
        [u, v],
      ];
  const term = `${klammer(p)}${klammer(q)}`;
  const ab = produkt(u, v);
  const ergebnis = multipliziere(p, q);
  const einzeln = p.flatMap((a) => q.map((c) => produkt(a, c)));
  const [uu, vv] = [quadrat(u), quadrat(v)];
  const mittelglied = [
    [1, -1],
    [-1, -1],
    [1, 1],
    [-1, 1],
  ].map(([s, t]) => alsEingabe([uu, mal(ab, 2 * (s ?? 1)), mal(vv, t ?? 1)]));
  return {
    art: "dritte",
    frage: "Multipliziere mit der dritten binomischen Formel aus:",
    term,
    zahl: false,
    form: "ausmultipliziert",
    loesung: alsEingabe(ergebnis),
    ergebnis: `${term} = ${alsAnzeige(ergebnis)}`,
    schritte: [
      schritt(glieder(b), "Glieder:"),
      schritt(`${term} = ${alsAnzeige(einzeln)}`, "Vier Produkte:", "– die Mittelglieder heben sich auf."),
      schritt(`= ${quadratAnzeige(u)} − ${quadratAnzeige(v)} = ${alsAnzeige(ergebnis)}`, "Formel:"),
    ],
    tipp: `Einmal plus, einmal minus mit denselben Gliedern: a = ${g(u)}, b = ${g(v)}. Die Mittelglieder heben sich auf – es bleibt a² − b².`,
    fehler: [
      {
        nr: 3,
        kandidaten: mittelglied,
        meldung: `Hier gibt es kein Mittelglied: + ${g(ab)} und − ${g(ab)} heben sich auf. Es bleibt a² − b².`,
      },
      {
        nr: 3,
        kandidaten: [alsEingabe([uu, vv]), alsEingabe([mal(uu, -1), vv])],
        meldung: "Achte auf das Minus: Das letzte Produkt ist (+b) · (−b) = − b². Also a² − b², nicht a² + b².",
      },
      nichtQuadriert(u, v, [], -1),
    ],
    p: [u, v],
    q: [u, minusV],
    formel: 3,
    luecke: "",
  };
}

// --- Rückwärts ---------------------------------------------------------------

const MELDUNG_GLEICHE_FORMEL =
  "Da steht ein Mittelglied – das ist die 1. oder 2. Formel, also ein Quadrat (a ± b)². (a + b)(a − b) hätte kein Mittelglied.";

function faktorisieren(b: Binom, formel: number): Omit<TermAufgabe, "art" | "p" | "q" | "formel" | "luecke"> {
  const { u, v, m, n } = b;
  const mv = mal(v, -1);
  const uu = quadrat(u);
  const vv = quadrat(v);
  const mitte = mal(produkt(u, v), 2);
  const summe = formel === 1 ? [uu, mitte, vv] : formel === 2 ? [uu, mal(mitte, -1), vv] : [uu, mal(vv, -1)];
  const loesung =
    formel === 1 ? `${ein([u, v])}^2` : formel === 2 ? `${ein([u, mv])}^2` : `${ein([u, v])}${ein([u, mv])}`;
  const anzeige =
    formel === 1
      ? `${klammer([u, v])}²`
      : formel === 2
        ? `${klammer([u, mv])}²`
        : `${klammer([u, v])}${klammer([u, mv])}`;
  const quadrate = quadrateSchritt(u, v);
  const variable = Object.keys(v.e);
  const doppelt = [glied(2 * n, ...variable), glied(2 * m * n, ...variable)];
  const q2 = (p: Polynom): string => `${ein(p)}^2`;
  return {
    frage: "Schreib als Produkt mit einer binomischen Formel:",
    term: alsAnzeige(summe),
    zahl: false,
    form: "faktorisiert",
    loesung,
    ergebnis: `${alsAnzeige(summe)} = ${anzeige}`,
    schritte:
      formel === 3
        ? [
            quadrate,
            schritt("a² − b² = (a + b)(a − b)", "Kein Mittelglied und ein Minus dazwischen → 3. Formel:"),
            schritt(`${alsAnzeige(summe)} = ${anzeige}`, "Ergebnis:"),
          ]
        : [
            quadrate,
            schritt(
              `2 · ${g(u)} · ${g(v)} = ${g(mitte)}`,
              "Probe Mittelglied:",
              `✓, Vorzeichen ${formel === 1 ? "+ → 1. Formel" : "− → 2. Formel"}`,
            ),
            schritt(`${alsAnzeige(summe)} = ${anzeige}`, "Ergebnis:"),
          ],
    tipp:
      formel === 3
        ? "Kein Mittelglied, dazwischen ein Minus: Das ist die 3. Formel. Welche Terme ergeben quadriert die beiden Glieder?"
        : "Welche Terme ergeben quadriert das erste und das letzte Glied? Prüf dann das Mittelglied: Ist es 2 · a · b? Sein Vorzeichen sagt dir, ob + oder −.",
    fehler:
      formel === 3
        ? [
            {
              nr: 6,
              kandidaten: [q2([u, v]), q2([u, mv])],
              meldung: "Kein Mittelglied, dazwischen ein Minus: Das ist die 3. Formel, (a + b)(a − b).",
            },
          ]
        : [
            {
              nr: 6,
              kandidaten: [q2([u, formel === 1 ? mv : v])],
              meldung: "Schau auf das Vorzeichen des Mittelglieds: + → (a + b)², − → (a − b)².",
            },
            {
              nr: 6,
              kandidaten: doppelt.flatMap((d) => [q2([u, d]), q2([u, mal(d, -1)])]),
              meldung: "Das Mittelglied ist 2 · a · b – doppelt so groß wie a · b. Bei 6x ist b = 3, nicht 6.",
            },
            { nr: 6, kandidaten: [`${ein([u, v])}${ein([u, mv])}`], meldung: MELDUNG_GLEICHE_FORMEL },
          ],
  };
}

const variablenteil = (a: Glied): string => (hatVariable(a) ? g({ k: 1, e: a.e }) : "");

function lueckeAufgabe(
  b: Binom,
  formel: number,
  luecke: "mitte" | "ende",
): Omit<TermAufgabe, "art" | "p" | "q" | "formel" | "luecke"> {
  const { u, v, m, n } = b;
  const uu = quadrat(u);
  const vv = quadrat(v);
  const mitte = mal(produkt(u, v), 2);
  const op = formel === 2 ? " − " : " + ";
  const loesung = luecke === "mitte" ? mitte.k : vv.k;
  const term =
    luecke === "mitte"
      ? `${g(uu)}${op}□${variablenteil(mitte)} + ${g(vv)}`
      : `${g(uu)}${op}${g(mitte)} + □${variablenteil(vv)}`;
  return {
    frage: "Ergänze die Zahl in der Lücke so, dass eine binomische Formel entsteht:",
    term,
    zahl: true,
    form: "ausmultipliziert",
    loesung: String(loesung),
    ergebnis: term.replace("□", String(loesung)),
    schritte:
      luecke === "mitte"
        ? [
            quadrateSchritt(u, v),
            schritt(`2 · ${g(u)} · ${g(v)} = ${g(mitte)}`, "Mittelglied:"),
            ["In die Lücke gehört ", String(loesung), "."],
          ]
        : [
            [
              "Erstes Glied: ",
              `a = ${g(u)}`,
              ", Mittelglied: ",
              `${g(mitte)} = 2 · ${g(u)} · b`,
              ", also ",
              `b = ${g(v)}`,
            ],
            schritt(`b² = ${quadratAnzeige(v)} = ${g(vv)}`, "Letztes Glied:"),
            ["In die Lücke gehört ", String(loesung), "."],
          ],
    tipp:
      luecke === "mitte"
        ? "Bestimme a und b aus dem ersten und letzten Glied. Das Mittelglied ist 2 · a · b."
        : "Das Mittelglied ist 2 · a · b. Teile es durch 2 · a, dann hast du b. In die Lücke gehört b².",
    fehler:
      luecke === "mitte"
        ? [
            {
              nr: 1,
              kandidaten: [String(m * n)],
              meldung: "Das Mittelglied ist 2 · a · b, nicht a · b. Vergiss die 2 nicht.",
            },
          ]
        : [
            {
              nr: 6,
              kandidaten: [String(mitte.k * mitte.k)],
              meldung: "Das Mittelglied ist 2 · a · b – doppelt so groß wie a · b. Bei 6x ist b = 3, nicht 6.",
            },
            {
              kandidaten: [String(n), String(mitte.k / 2)].filter((k) => k !== String(loesung)),
              meldung: "Du hast b gefunden – in die Lücke gehört aber b², also b mal b.",
            },
          ],
  };
}

function rueckwaerts(z: Zufall, vorgaben: Vorgaben): TermAufgabe {
  const fest = vorgaben.formel !== undefined;
  const typ = fest ? "faktorisieren" : z.wahl(["faktorisieren", "faktorisieren", "luecke"]);
  const formel = vorgaben.formel ?? z.wahl(typ === "luecke" ? [1, 2] : [1, 2, 3]);
  const luecke = typ === "luecke" ? z.wahl(["mitte", "ende"] as const) : "";
  const b = waehleBinom(z, vorgaben);
  const teil = luecke === "" ? faktorisieren(b, formel) : lueckeAufgabe(b, formel, luecke);
  return { art: "rueckwaerts", ...teil, p: [b.u, b.v], q: [b.u, b.v], formel, luecke };
}

const GENERATOREN: Record<Art, (z: Zufall, v: Vorgaben) => TermAufgabe> = {
  klammern,
  erste,
  zweite,
  dritte,
  rueckwaerts,
};

/** Die Aufgabe einer Art, aus dem Zufall oder den festen Vorgaben. */
export const erzeugeTermAufgabe = (art: Art, z: Zufall, vorgaben: Vorgaben = {}): TermAufgabe =>
  GENERATOREN[art](z, vorgaben);
