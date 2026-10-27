// Terme mit Variablen lesen: Tokenizer und Parser (rekursiver Abstieg, kein eval) → Syntaxbaum, Auswerten an einer
// Belegung, schön gesetzter Text. Reine Funktionen; aus dem Kern der alten Lern-Apps (variablenterm.js) übernommen.
// - Variablen: Einzelbuchstaben a–z (klein). Implizite Multiplikation (2x, 3ab, 2(x+1), (a+b)(a−b)) bindet wie "*".
// - Potenzen mit ^ (ganze Hochzahl 0–64, auch ^(3)) oder Hochzahlen ⁰–⁹; Vorzeichen binden schwächer: −x² = −(x²).
// - Malzeichen * · × ⋅, Geteilt / :, Minus - − –, Dezimalkomma oder -punkt.
// Grammatik: ausdruck = term (('+'|'-') term)*
//            term     = faktor (('*'|'/') faktor | faktor-ohne-Vorzeichen)*
//            faktor   = ('-'|'+') faktor | basis hochzahl*
//            basis    = zahl | variable | '(' ausdruck ')'

export type Knoten =
  | { art: "zahl"; wert: number; text: string }
  | { art: "variable"; name: string }
  | { art: "klammer" | "negativ"; arg: Knoten }
  | { art: "plus" | "minus" | "mal" | "geteilt"; links: Knoten; rechts: Knoten }
  | { art: "potenz"; basis: Knoten; exponent: number };

export type GelesenerTerm =
  | { baum: Knoten; variablen: string[]; text: string; fehler?: never }
  | { fehler: string; meldung: string; baum?: never };

type Token =
  | { typ: "zahl"; text: string }
  | { typ: "variable"; name: string }
  | { typ: "op"; text: string }
  | { typ: "hoch"; wert: number };

const MAX_EXPONENT = 64;
const HOCHZAHLEN = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const ERSATZ: Record<string, string> = { "−": "-", "–": "-", "·": "*", "×": "*", "⋅": "*", ":": "/" };
const TOKEN = /\s*(?:(\d+(?:[.,]\d+)?)|([a-z])|([-+*/^()])|([⁰¹²³⁴⁵⁶⁷⁸⁹]+)|(\S))/iy;

const MELDUNGEN: Record<string, string> = {
  grossbuchstabe: "Schreib Variablen als kleine Buchstaben, z. B. x.",
  "klammer-fehlt": "Es fehlt eine schließende Klammer ).",
  "klammer-zu-viel": "Da ist eine Klammer ) zu viel.",
  unvollstaendig: "Der Term ist noch unvollständig.",
  "zahl-dahinter": "Schreib Potenzen mit ^ oder ², z. B. x^2, und Produkte mit *, z. B. x*2.",
  exponent: "Hochzahlen sind ganze Zahlen von 0 bis 64, z. B. x^2.",
};

class SyntaxFehler extends Error {
  readonly code: string;
  readonly meldung: string;
  constructor(code: string, zeichen = "") {
    super(code);
    this.code = code;
    this.meldung = code === "zeichen" ? `Das Zeichen „${zeichen}“ kenne ich hier nicht.` : (MELDUNGEN[code] ?? "");
  }
}

function tokenisiere(text: string): Token[] {
  const s = text.replace(/[−–·×⋅:]/g, (z) => ERSATZ[z] ?? z).trim();
  const tokens: Token[] = [];
  let pos = 0;
  while (pos < s.length) {
    TOKEN.lastIndex = pos;
    const m = TOKEN.exec(s);
    if (!m) break; // nur noch Leerraum
    pos = TOKEN.lastIndex;
    const [, zahl, variable, op, hoch, sonst] = m;
    if (zahl) tokens.push({ typ: "zahl", text: zahl });
    else if (variable) {
      if (variable !== variable.toLowerCase()) throw new SyntaxFehler("grossbuchstabe");
      tokens.push({ typ: "variable", name: variable });
    } else if (op) tokens.push({ typ: "op", text: op });
    else if (hoch)
      tokens.push({
        typ: "hoch",
        wert: Number(
          hoch
            .split("")
            .map((z) => HOCHZAHLEN.indexOf(z))
            .join(""),
        ),
      });
    else throw new SyntaxFehler("zeichen", sonst);
  }
  return tokens;
}

function parse(tokens: Token[]): Knoten {
  let i = 0;
  const jetzt = (): Token | undefined => tokens[i];
  const istOp = (text: string): boolean => {
    const t = jetzt();
    return t?.typ === "op" && t.text === text;
  };
  const beginntFaktor = (t: Token | undefined): boolean =>
    t !== undefined && (t.typ === "variable" || (t.typ === "op" && t.text === "("));

  function klammer(): Knoten {
    i++; // "("
    const arg = ausdruck();
    if (!istOp(")")) throw new SyntaxFehler(jetzt() ? "unvollstaendig" : "klammer-fehlt");
    i++;
    return { art: "klammer", arg };
  }
  function basis(): Knoten {
    const t = jetzt();
    if (!t) throw new SyntaxFehler("unvollstaendig");
    if (t.typ === "zahl") {
      i++;
      return { art: "zahl", wert: Number(t.text.replace(",", ".")), text: t.text };
    }
    if (t.typ === "variable") {
      i++;
      return { art: "variable", name: t.name };
    }
    if (istOp("(")) return klammer();
    throw new SyntaxFehler("unvollstaendig");
  }
  function exponent(): number {
    const t = jetzt();
    if (t?.typ === "hoch") {
      i++;
      return t.wert;
    }
    i++; // "^"
    const inKlammer = istOp("(");
    if (inKlammer) i++;
    const z = jetzt();
    if (!z || z.typ !== "zahl" || !/^\d+$/.test(z.text)) throw new SyntaxFehler("exponent");
    i++;
    if (inKlammer) {
      if (!istOp(")")) throw new SyntaxFehler("exponent");
      i++;
    }
    return Number(z.text);
  }
  function faktor(): Knoten {
    if (istOp("-")) {
      i++;
      return { art: "negativ", arg: faktor() };
    }
    if (istOp("+")) {
      i++;
      return faktor();
    }
    let b = basis();
    while (jetzt()?.typ === "hoch" || istOp("^")) {
      const e = exponent();
      if (e > MAX_EXPONENT) throw new SyntaxFehler("exponent");
      b = { art: "potenz", basis: b, exponent: e };
    }
    return b;
  }
  function term(): Knoten {
    let a = faktor();
    for (;;) {
      if (istOp("*") || istOp("/")) {
        const art = istOp("*") ? "mal" : "geteilt";
        i++;
        a = { art, links: a, rechts: faktor() };
      } else if (beginntFaktor(jetzt())) a = { art: "mal", links: a, rechts: faktor() };
      else if (jetzt()?.typ === "zahl") throw new SyntaxFehler("zahl-dahinter");
      else return a;
    }
  }
  function ausdruck(): Knoten {
    let a = term();
    while (istOp("+") || istOp("-")) {
      const art = istOp("+") ? "plus" : "minus";
      i++;
      a = { art, links: a, rechts: term() };
    }
    return a;
  }
  const baum = ausdruck();
  if (i < tokens.length) throw new SyntaxFehler(istOp(")") ? "klammer-zu-viel" : "unvollstaendig");
  return baum;
}

/** Die Kinder eines Knotens, für Durchläufe über den ganzen Baum. */
export function kinder(k: Knoten): Knoten[] {
  if ("arg" in k) return [k.arg];
  if ("basis" in k) return [k.basis];
  if ("links" in k) return [k.links, k.rechts];
  return [];
}

function sammleVariablen(k: Knoten, menge = new Set<string>()): Set<string> {
  if (k.art === "variable") menge.add(k.name);
  for (const kind of kinder(k)) sammleVariablen(kind, menge);
  return menge;
}

/** Liest einen Term: { baum, variablen (sortiert), text (schön gesetzt) } oder { fehler, meldung }. */
export function leseTerm(text: unknown): GelesenerTerm {
  try {
    const tokens = tokenisiere(typeof text === "string" ? text : "");
    if (tokens.length === 0) return { fehler: "leer", meldung: "" };
    const baum = parse(tokens);
    return { baum, variablen: [...sammleVariablen(baum)].sort(), text: formatTerm(baum) };
  } catch (e) {
    if (e instanceof SyntaxFehler) return { fehler: e.code, meldung: e.meldung };
    throw e;
  }
}

/** Wert des Baums für eine Belegung { x: 2, … }; NaN oder ±Infinity, wo der Term nicht definiert ist. */
export function auswerten(k: Knoten, belegung: Record<string, number>): number {
  const w = (kind: Knoten): number => auswerten(kind, belegung);
  switch (k.art) {
    case "zahl":
      return k.wert;
    case "variable":
      return belegung[k.name] ?? NaN;
    case "klammer":
      return w(k.arg);
    case "negativ":
      return -w(k.arg);
    case "plus":
      return w(k.links) + w(k.rechts);
    case "minus":
      return w(k.links) - w(k.rechts);
    case "mal":
      return w(k.links) * w(k.rechts);
    case "geteilt":
      return w(k.links) / w(k.rechts);
    case "potenz":
      return w(k.basis) ** k.exponent;
  }
}

const hoch = (n: number): string =>
  String(n)
    .split("")
    .map((d) => HOCHZAHLEN[Number(d)] ?? "")
    .join("");
const mitVorzeichenInKlammer = (k: Knoten): string => (k.art === "negativ" ? `(${formatTerm(k)})` : formatTerm(k));

/** Setzt einen Baum schön: x^2 → x², 3*x → 3x, - → −. Klammern der Eingabe bleiben stehen. */
export function formatTerm(k: Knoten): string {
  switch (k.art) {
    case "zahl":
      return k.text.replace(".", ",");
    case "variable":
      return k.name;
    case "klammer":
      return `(${formatTerm(k.arg)})`;
    case "negativ":
      return `−${k.arg.art === "negativ" ? `(${formatTerm(k.arg)})` : formatTerm(k.arg)}`;
    case "plus":
      return `${formatTerm(k.links)} + ${mitVorzeichenInKlammer(k.rechts)}`;
    case "minus":
      return `${formatTerm(k.links)} − ${mitVorzeichenInKlammer(k.rechts)}`;
    case "geteilt":
      return `${formatTerm(k.links)}/${mitVorzeichenInKlammer(k.rechts)}`;
    case "mal": {
      const links = k.links.art === "geteilt" ? `(${formatTerm(k.links)})` : formatTerm(k.links);
      const rechts = mitVorzeichenInKlammer(k.rechts);
      return /^[a-z(]/.test(rechts) && !rechts.startsWith("(−") ? `${links}${rechts}` : `${links}·${rechts}`;
    }
    case "potenz": {
      const b = formatTerm(k.basis);
      const atomar = ["zahl", "variable", "klammer"].includes(k.basis.art) && !b.includes(",");
      return `${atomar ? b : `(${b})`}${hoch(k.exponent)}`;
    }
  }
}
