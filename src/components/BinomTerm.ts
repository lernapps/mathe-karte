// Terme für die binomischen Formeln: Glieder und Polynome bauen, ausmultiplizieren, schreiben (Eingabe, Anzeige,
// LaTeX), Eingaben prüfen (Gleichwertigkeit, Form, Binom-Struktur, Fehlterme) und der Zufall der Aufgaben. Reine
// Funktionen; aus terme.js, binom.js und termantwort.js der alten Lern-App übernommen. Ein Glied ist
// { k: Koeffizient, e: { variable: Hochzahl } }, ein Polynom eine Liste von Gliedern.
import { type Zufall, mulberry32, zufallAusFolge } from "./Zufallszahlen.ts";
import { auswerten, kinder, leseTerm, type GelesenerTerm, type Knoten } from "./BinomParser.ts";

export interface Glied {
  k: number;
  e: Record<string, number>;
}
export type Polynom = Glied[];

// --- Glieder und Polynome ----------------------------------------------------

/** glied(3, "a", "b") = 3ab, glied(1, "x", "x") = x², glied(5) = 5. */
export function glied(k: number, ...variablen: string[]): Glied {
  const e: Record<string, number> = {};
  for (const v of variablen) e[v] = (e[v] ?? 0) + 1;
  return { k, e };
}

const schluessel = (g: Glied): string =>
  Object.keys(g.e)
    .sort()
    .map((v) => `${v}${g.e[v]}`)
    .join("");

function zusammenfassen(glieder: Polynom): Polynom {
  const summe = new Map<string, Glied>();
  for (const g of glieder) {
    const s = schluessel(g);
    const alt = summe.get(s);
    summe.set(s, alt ? { k: alt.k + g.k, e: alt.e } : { k: g.k, e: { ...g.e } });
  }
  return [...summe.values()].filter((g) => g.k !== 0);
}

/** Jedes Glied von p mal jedes Glied von q, gleichartige Glieder zusammengefasst (Reihenfolge wie beim Rechnen). */
export function multipliziere(p: Polynom, q: Polynom): Polynom {
  const produkte: Polynom = [];
  for (const g of p) {
    for (const h of q) {
      const e = { ...g.e };
      for (const [v, n] of Object.entries(h.e)) e[v] = (e[v] ?? 0) + n;
      produkte.push({ k: g.k * h.k, e });
    }
  }
  return zusammenfassen(produkte);
}

export const addiere = (p: Polynom, q: Polynom): Polynom => zusammenfassen([...p, ...q]);
/** Das Glied mal eine Zahl: mal(3x, −2) = −6x. */
export const mal = (g: Glied, k: number): Glied => ({ k: g.k * k, e: { ...g.e } });
/** Produkt zweier Glieder: produkt(x, 3) = 3x. */
export const produkt = (g: Glied, h: Glied): Glied => multipliziere([g], [h])[0] ?? glied(0);
export const quadrat = (g: Glied): Glied => produkt(g, g);
/** Das Glied ohne Vorzeichen. */
export const betrag = (g: Glied): Glied => ({ k: Math.abs(g.k), e: { ...g.e } });
export const hatVariable = (g: Glied): boolean => Object.keys(g.e).length > 0;

// --- Schreiben ---------------------------------------------------------------

interface Schreibweise {
  hoch: (n: number) => string;
  plus: string;
  minus: string;
  vorne: string;
}
const HOCH = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const ANZEIGE: Schreibweise = {
  hoch: (n) =>
    String(n)
      .split("")
      .map((z) => HOCH[Number(z)] ?? "")
      .join(""),
  plus: " + ",
  minus: " − ",
  vorne: "−",
};
const EINGABE: Schreibweise = { hoch: (n) => `^${n}`, plus: "+", minus: "-", vorne: "-" };
const LATEX: Schreibweise = { hoch: (n) => `^${n}`, plus: " + ", minus: " - ", vorne: "-" };

function variablenteil(g: Glied, w: Schreibweise): string {
  return Object.keys(g.e)
    .sort()
    .filter((v) => (g.e[v] ?? 0) > 0)
    .map((v) => (g.e[v] === 1 ? v : `${v}${w.hoch(g.e[v] ?? 1)}`))
    .join("");
}

function betragText(g: Glied, w: Schreibweise): string {
  const teil = variablenteil(g, w);
  const k = Math.abs(g.k);
  return teil && k === 1 ? teil : `${k}${teil}`;
}

function setze(p: Polynom, w: Schreibweise): string {
  if (p.length === 0) return "0";
  return p
    .map((g, i) => {
      const b = betragText(g, w);
      if (i === 0) return g.k < 0 ? `${w.vorne}${b}` : b;
      return `${g.k < 0 ? w.minus : w.plus}${b}`;
    })
    .join("");
}

/** Eingabeform: "2x^2+7x-4". */
export const alsEingabe = (p: Polynom): string => setze(p, EINGABE);
/** Anzeigeform: "2x² + 7x − 4". */
export const alsAnzeige = (p: Polynom): string => setze(p, ANZEIGE);
/** LaTeX ohne $: "2x^2 + 7x - 4". */
export const alsLatex = (p: Polynom): string => setze(p, LATEX);
/** Ein Glied mit Vorzeichen: "−x²", "12ab". */
export const gliedAnzeige = (g: Glied): string => alsAnzeige([g]);
export const gliedLatex = (g: Glied): string => alsLatex([g]);

/** Quadrat eines Glieds als Rechenschritt: x², 4², (3a)². */
function quadratText(g: Glied, w: Schreibweise): string {
  const b = betrag(g);
  const ohneZahl = b.k === 1 && Object.keys(g.e).length === 1;
  const text = !hatVariable(g) ? String(b.k) : ohneZahl ? variablenteil(g, w) : `(${setze([b], w)})`;
  return `${text}${w.hoch(2)}`;
}
export const quadratAnzeige = (g: Glied): string => quadratText(g, ANZEIGE);
export const quadratLatex = (g: Glied): string => quadratText(g, LATEX);

// --- Zufall ------------------------------------------------------------------

export type { Zufall } from "./Zufallszahlen.ts";

/** Deterministischer Zufall (mulberry32) zu einer Aufgabennummer: gleiche Nummer, gleiche Aufgabe. */
export function erzeugeZufall(seed: number): Zufall {
  // aufeinanderfolgende Nummern (1, 2, 3, …) erst streuen, sonst ähneln sich ihre ersten Zufallszahlen
  return zufallAusFolge(mulberry32(Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) >>> 0));
}

// --- Prüfen ------------------------------------------------------------------

const GRUNDWERTE = [2.31, -1.73, 3.17, -2.59, 1.41, 4.03, -0.67, 2.87];
const SPIELRAUM = 1e-9;
const MIN_STELLEN = 5;
export const MELDUNG_KEIN_TERM = "Das konnte ich nicht lesen. Schreib einen Term wie x^2 + 6x + 9 oder (a+b)(a-b).";

type TermEingabe = string | GelesenerTerm;
const alsTerm = (t: TermEingabe): GelesenerTerm => (typeof t === "string" ? leseTerm(t) : t);
const nahe = (a: number, b: number): boolean => Math.abs(a - b) <= SPIELRAUM * Math.max(1, Math.abs(a), Math.abs(b));

/** Gleichwertig: an 8 festen Stellen (ohne 0 und ±1, jede Variable anders) gleicher Wert. */
export function sindGleichwertig(term1: TermEingabe, term2: TermEingabe): boolean {
  const a = alsTerm(term1);
  const b = alsTerm(term2);
  if (a.fehler !== undefined || b.fehler !== undefined) return false;
  const variablen = [...new Set([...a.variablen, ...b.variablen])].sort();
  let gueltig = 0;
  for (let j = 0; j < GRUNDWERTE.length; j++) {
    const stelle = Object.fromEntries(
      variablen.map((v, k) => [v, (GRUNDWERTE[(j + k) % GRUNDWERTE.length] ?? 1) * (1 + 0.13 * k)]),
    );
    const x = auswerten(a.baum, stelle);
    const y = auswerten(b.baum, stelle);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (!nahe(x, y)) return false;
    gueltig++;
  }
  return gueltig >= MIN_STELLEN;
}

/** Ist die Eingabe gleichwertig zum (falschen) Kandidaten, z. B. a^2+b^2 bei (a+b)²? */
export const passtZuTerm = (eingabe: string, kandidat: string | Polynom): boolean =>
  sindGleichwertig(eingabe, typeof kandidat === "string" ? kandidat : alsEingabe(kandidat));

function glieder(k: Knoten, liste: Knoten[] = []): Knoten[] {
  if (k.art === "plus" || k.art === "minus") {
    glieder(k.links, liste);
    glieder(k.rechts, liste);
  } else if (k.art === "negativ") glieder(k.arg, liste);
  else liste.push(k);
  return liste;
}

const enthaeltVariable = (k: Knoten): boolean => k.art === "variable" || kinder(k).some(enthaeltVariable);

/** Ein Monom: höchstens eine Zahl als Faktor, jede Variable höchstens einmal. → Signatur oder Formfehler. */
function monom(k: Knoten): { signatur: string } | { fehler: string } {
  let zahlen = 0;
  const exponenten: Record<string, number> = {};
  let fehler: string | undefined;
  const sammle = (t: Knoten): void => {
    if (t.art === "mal") {
      sammle(t.links);
      sammle(t.rechts);
    } else if (t.art === "negativ") sammle(t.arg);
    else if (t.art === "variable" || (t.art === "potenz" && t.basis.art === "variable")) {
      const name = t.art === "variable" ? t.name : t.basis.art === "variable" ? t.basis.name : "";
      if (exponenten[name] !== undefined) fehler ??= "nicht-zusammengefasst";
      exponenten[name] = t.art === "potenz" ? t.exponent : 1;
    } else if (!enthaeltVariable(t) && t.art !== "klammer") zahlen++;
    else fehler = "nicht-ausmultipliziert";
  };
  sammle(k);
  if (fehler === "nicht-ausmultipliziert") return { fehler };
  if (fehler !== undefined || zahlen > 1) return { fehler: "nicht-zusammengefasst" };
  const signatur = Object.keys(exponenten)
    .sort()
    .filter((v) => exponenten[v] !== 0)
    .map((v) => `${v}^${exponenten[v]}`)
    .join("*");
  return { signatur };
}

/** Formfehler: undefined, wenn die Form passt, sonst "nicht-ausmultipliziert" | "nicht-zusammengefasst" | "nicht-faktorisiert". */
export function formFehler(baum: Knoten, form: "ausmultipliziert" | "faktorisiert"): string | undefined {
  if (form === "faktorisiert") {
    let k = baum;
    while (k.art === "negativ" || k.art === "klammer") k = k.arg;
    return k.art === "plus" || k.art === "minus" ? "nicht-faktorisiert" : undefined;
  }
  const monome = glieder(baum).map(monom);
  const erster =
    monome.find((m) => "fehler" in m && m.fehler === "nicht-ausmultipliziert") ?? monome.find((m) => "fehler" in m);
  if (erster && "fehler" in erster) return erster.fehler;
  const signaturen = monome.map((m) => ("signatur" in m ? m.signatur : ""));
  return new Set(signaturen).size < signaturen.length ? "nicht-zusammengefasst" : undefined;
}

const FORM_MELDUNGEN: Record<string, string> = {
  "nicht-ausmultipliziert": "Der Term stimmt – jetzt noch ausmultiplizieren, bis keine Klammer mehr übrig ist.",
  "nicht-zusammengefasst": "Der Term stimmt – fasse noch gleichartige Glieder zusammen.",
  "nicht-faktorisiert": "Der Term stimmt – schreib ihn noch als Produkt, z. B. (a + b)(a − b).",
};

export interface TermErgebnis {
  korrekt: boolean;
  /** undefined | "falsch" | "kein-term" | ein Formfehler */
  fehler?: string;
  meldung?: string;
}

/** Prüft eine Termeingabe gegen den erwarteten Term, mit der verlangten Form. */
export function pruefeTerm(text: string, erwartet: string, form: "ausmultipliziert" | "faktorisiert"): TermErgebnis {
  const a = leseTerm(text);
  if (a.fehler !== undefined) return { korrekt: false, fehler: "kein-term", meldung: a.meldung || MELDUNG_KEIN_TERM };
  if (!sindGleichwertig(a, erwartet)) return { korrekt: false, fehler: "falsch" };
  const fehler = formFehler(a.baum, form);
  if (fehler) return { korrekt: false, fehler, meldung: FORM_MELDUNGEN[fehler] ?? "" };
  return { korrekt: true };
}

const ohneKlammer = (k: Knoten): Knoten => (k.art === "klammer" ? ohneKlammer(k.arg) : k);
const anzahlGlieder = (k: Knoten): number =>
  k.art === "plus" || k.art === "minus" ? anzahlGlieder(k.links) + anzahlGlieder(k.rechts) : 1;
const istBinomKlammer = (k: Knoten): boolean => k.art === "klammer" && anzahlGlieder(ohneKlammer(k)) === 2;

/** Steht der Term als Binom-Produkt da: (x + 3)², (x + 4)(x − 4)? Nicht: 1·(x² + 6x + 9), 2(x + 3)², (x + 3)³. */
export function istBinomProdukt(text: string): boolean {
  const t = leseTerm(text);
  if (t.fehler !== undefined) return false;
  const k = ohneKlammer(t.baum);
  if (k.art === "potenz") return k.exponent === 2 && istBinomKlammer(k.basis);
  if (k.art === "mal") return istBinomKlammer(k.links) && istBinomKlammer(k.rechts);
  return false;
}

/** Fehlterme der Reihe nach: [Fehlercode, [Kandidat als Text oder Polynom, …]]. */
export type Regeln = [string, (string | Polynom)[]][];

/** Der Code des ersten Fehlterms, zu dem die (falsche) Eingabe passt; Kandidaten gleich dem richtigen Term zählen nicht. */
export function diagnose(eingabe: string, richtig: string, regeln: Regeln): string {
  for (const [code, kandidaten] of regeln) {
    for (const k of kandidaten) {
      const text = typeof k === "string" ? k : alsEingabe(k);
      if (!sindGleichwertig(text, richtig) && passtZuTerm(eingabe, text)) return code;
    }
  }
  return "falsch";
}

/** Liest eine ganze Zahl wie "12", " 12 ", "−4"; sonst undefined. */
export function leseGanzzahl(text: string): number | undefined {
  const s = text.trim().replace(/[−–]/g, "-");
  return /^-?\d+$/.test(s) ? Number(s) : undefined;
}

// --- Rechenweg ---------------------------------------------------------------

/** Ein Schritt des Rechenwegs: abwechselnd Text und Rechnung (Unicode wie x² − 2 · x · 5), mit Text vorn. */
export type Schritt = string[];

/** Eine Rechnung in Unicode (x² − 2 · x · 5) als LaTeX (x^2 - 2 \cdot x \cdot 5). */
export function zuLatex(formel: string): string {
  return formel
    .replace(
      /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g,
      (h) =>
        `^${h
          .split("")
          .map((z) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(z))
          .join("")}`,
    )
    .replace(/−/g, "-")
    .replace(/ · /g, " \\cdot ")
    .replace(/□/g, "\\text{□}");
}

/** Ein Schritt als Markdown: Text bleibt, jede Rechnung steht in $…$. */
export const schrittMarkdown = (schritt: Schritt): string =>
  schritt.map((teil, i) => (i % 2 === 1 ? `$${zuLatex(teil)}$` : teil)).join("");

/** Ein Schritt zum Lesen in der Übung. */
export const schrittText = (schritt: Schritt): string => schritt.join("");
