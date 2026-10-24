// Der Rechenkern der Prozent-Übungen: Zufall aus der Aufgabennummer, exakte Brüche, Zahlen deutsch schreiben, Eingaben
// lesen und nach einer Rundungsregel prüfen. Rein, ohne DOM; portiert aus kern/js (zufall, bruch, zahlen, zahlantwort)
// der alten Lern-App.

import {
  type Bruch,
  bruch,
  durch,
  endStellen as endStellenBruch,
  gleich,
  mal,
  minus,
  plus,
  runde as rundeBruch,
  zahl,
} from "./Bruch.ts";
import { type Zufall, mulberry32, zufallAusFolge } from "./Zufallszahlen.ts";

export { type Bruch, bruch, durch, gleich, mal, minus, plus, zahl } from "./Bruch.ts";
export type { Zufall } from "./Zufallszahlen.ts";

/** Der exakte Bruch einer endlichen Dezimalzahl: 12.5 → 25/2. */
export function alsBruch(x: number): Bruch {
  const [ganz = "0", rest = ""] = String(x).split(".");
  const negativ = ganz.startsWith("-");
  const betrag = Number(ganz.replace("-", "") + rest);
  return bruch(negativ ? -betrag : betrag, 10 ** rest.length);
}

/** Wie viele Nachkommastellen der Bruch als Dezimalzahl hat; null, wenn er nicht abbricht oder mehr als 6 hat. */
export function endStellen(b: Bruch): number | null {
  const stellen = endStellenBruch(b);
  return stellen <= 6 ? stellen : null;
}

/**
 * Der Zufall der Aufgabe `seed` einer Übung `salz`: Nummer und Salz werden erst gemischt, damit benachbarte Nummern
 * und verschiedene Übungen nicht dieselben Zahlen ziehen.
 */
export function erzeugeZufall(seed: number, salz = ""): Zufall {
  let h = 2166136261;
  for (const zeichen of `${salz}#${seed}`) h = Math.imul(h ^ (zeichen.codePointAt(0) ?? 0), 16777619);
  return zufallAusFolge(mulberry32(h >>> 0));
}

/** Kaufmännisch runden für die Anzeige (formatZahl); geprüft wird exakt mit Brüchen (pruefeZahl). */
export function runde(x: number, stellen = 2): number {
  const faktor = 10 ** stellen;
  return Math.round((x + Number.EPSILON) * faktor + 1e-9 * Math.sign(x)) / faktor;
}

/** Deutsch mit Komma, höchstens zwei Nachkommastellen (oder genau `stellen`). */
export function formatZahl(x: number, stellen?: number): string {
  if (stellen === undefined) return String(runde(x, 2)).replace(".", ",");
  return runde(x, stellen).toFixed(stellen).replace(".", ",");
}

/** Ein Zwischenwert ohne sichtbare Rundung: bis zu sechs Nachkommastellen (1,125 bleibt 1,125). */
export const formatGenau = (x: number): string => String(runde(x, 6)).replace(".", ",");

/** Eine Zahl nach ihrer Art: Euro mit zwei Nachkommastellen (780,50), ganze Beträge ohne Komma. */
export function formatWert(x: number, einheit = ""): string {
  if (einheit === "€") return Number.isInteger(runde(x, 2)) ? formatZahl(x, 0) : formatZahl(x, 2);
  return formatZahl(x);
}

/** Zahl mit Einheit, mit geschütztem Leerzeichen: „250 €“, „780,50 €“, „12,5 %“. */
export const mitEinheit = (x: number, einheit = ""): string =>
  einheit ? `${formatWert(x, einheit)} ${einheit}` : formatZahl(x);

/** „=“ nur, wenn die gezeigte Zahl den exakten Wert trifft, sonst „≈“. */
export const gleichheitszeichen = (exakt: number, gezeigt: number): string =>
  Math.abs(exakt - gezeigt) <= 1e-9 * Math.max(1, Math.abs(exakt)) ? "=" : "≈";

/** Die Art eines Zahlenfelds: Geld, Prozentsatz oder eine andere Zahl; die Art gibt die Stellen vor. */
export type Art = "geld" | "prozent" | "zahl";
export const STELLEN: Readonly<Record<Art, number>> = { geld: 2, prozent: 1, zahl: 2 };
export const artFuer = (einheit: string): Art => (einheit === "€" ? "geld" : "zahl");

/** Eine gelesene Eingabe: eine Dezimalzahl (mit ihren Stellen), ein Term oder Bruch (exakt), oder nichts Lesbares. */
export type Eingabe =
  | { typ: "dezimal" | "term"; wert: Bruch; stellen: number }
  | { typ: "leer" | "ungueltig" | "gemischt" };

/** Liest einen Term aus Zahlen, + − · : / und Klammern exakt; null, wenn er sich nicht lesen lässt. */
function leseTerm(text: string): Bruch | null {
  const teile = text
    .replace(/[·×*]/g, "*")
    .replace(/[:÷]/g, "/")
    .replace(/−/g, "-")
    .match(/\d+(?:[.,]\d+)?|\S/g);
  if (teile === null) return null;
  let i = 0;
  const faktor = (): Bruch => {
    const t = teile[i++];
    if (t === "-") return mal(bruch(-1), faktor());
    if (t === "(") {
      const innen = summe();
      if (teile[i++] !== ")") throw new Error("Klammer");
      return innen;
    }
    if (t !== undefined && /^\d/.test(t)) return alsBruch(Number(t.replace(",", ".")));
    throw new Error("Zahl erwartet");
  };
  const produkt = (): Bruch => {
    let wert = faktor();
    while (teile[i] === "*" || teile[i] === "/")
      wert = teile[i++] === "*" ? mal(wert, faktor()) : durch(wert, faktor());
    return wert;
  };
  const summe = (): Bruch => {
    let wert = produkt();
    while (teile[i] === "+" || teile[i] === "-")
      wert = teile[i++] === "+" ? plus(wert, produkt()) : minus(wert, produkt());
    return wert;
  };
  try {
    const wert = summe();
    return i === teile.length ? wert : null;
  } catch {
    return null;
  }
}

/**
 * Liest eine Eingabe. Eine Einheit am Ende („€“, „Schüler“) zählt nicht; „%“ ist im Prozentfeld die Einheit und heißt
 * sonst Hundertstel. „1.250,50“ ist 1250,5; „3 1/3“ ist eine gemischte Zahl.
 */
export function leseEingabe(text: unknown, art: Art = "zahl"): Eingabe {
  let s = (typeof text === "string" ? text : typeof text === "number" ? String(text) : "").trim();
  if (s === "") return { typ: "leer" };
  s = s
    .replace(/\s*prozent$/i, " %")
    .replace(/\s*(?:€|euro|[a-zäöüß]+\.?)$/i, "")
    .trim();
  const prozent = s.endsWith("%");
  if (prozent) s = s.slice(0, -1).trim();
  if (s === "") return { typ: "ungueltig" };
  if (/^-?\d+\s+\d+\s*\/\s*\d+$/.test(s)) return { typ: "gemischt" };
  if (/^-?\d{1,3}(?:\.\d{3})+,\d+$/.test(s)) s = s.replace(/\./g, "");
  const dezimal = /^-?\d+(?:[.,](\d+))?$/.exec(s);
  let wert = leseTerm(s);
  if (wert === null) return { typ: "ungueltig" };
  let stellen = dezimal?.[1]?.length ?? 0;
  if (prozent && art !== "prozent") {
    wert = durch(wert, bruch(100));
    stellen += 2;
  }
  return { typ: dezimal ? "dezimal" : "term", wert, stellen };
}

export const MELDUNG_KEINE_ZAHL = "Bitte gib eine Zahl ein, zum Beispiel 12,5.";
const WOERTER = ["keine", "eine", "zwei", "drei"];
const stellenText = (n: number): string => `${WOERTER[n] ?? n} Nachkommastelle${n === 1 ? "" : "n"}`;

/** Das Urteil über eine Zahleneingabe: richtig, falsch, nichts Lesbares, oder nur ein Hinweis (fast richtig). */
export type Urteil =
  | { status: "richtig" | "falsch"; meldung?: undefined }
  | { status: "leer" | "hinweis"; meldung: string };

/**
 * Prüft eine Zahleneingabe gegen den exakten Wert. Eine Dezimalzahl mit d Nachkommastellen ist richtig, wenn sie den
 * Wert exakt trifft oder d ≥ `stellen` ist und sie der auf d Stellen kaufmännisch gerundete Wert ist (abschneiden ist
 * falsch). Mit weniger Stellen, aber richtig gerundet: ein Hinweis. Brüche und Terme zählen exakt, in Geldfeldern
 * auf den Cent.
 */
export function pruefeZahl(text: unknown, exakt: Bruch, art: Art, stellen = STELLEN[art]): Urteil {
  const eingabe = leseEingabe(text, art);
  if (eingabe.typ !== "dezimal" && eingabe.typ !== "term") {
    return eingabe.typ === "gemischt"
      ? { status: "hinweis", meldung: "Schreib gemischte Zahlen als Bruch, z. B. 10/3." }
      : { status: "leer", meldung: MELDUNG_KEINE_ZAHL };
  }
  if (gleich(eingabe.wert, exakt)) return { status: "richtig" };
  if (eingabe.typ === "term") {
    return art === "geld" && gleich(rundeBruch(eingabe.wert, stellen), rundeBruch(exakt, stellen))
      ? { status: "richtig" }
      : { status: "falsch" };
  }
  const d = eingabe.stellen;
  if (d > 12 || !gleich(eingabe.wert, rundeBruch(exakt, d))) return { status: "falsch" };
  if (d < stellen) return { status: "hinweis", meldung: `Fast – runde auf ${stellenText(stellen)}.` };
  return { status: "richtig" };
}

/** Für Fehlerdiagnosen: passt die Eingabe zu `wert`, gerundet auf die getippten Stellen? 0 passt nur zu 0. */
export function passtZu(text: unknown, wert: Bruch, art: Art): boolean {
  const eingabe = leseEingabe(text, art);
  if (eingabe.typ !== "dezimal" && eingabe.typ !== "term") return false;
  if (zahl(eingabe.wert) === 0 && zahl(wert) !== 0) return false;
  return pruefeZahl(text, wert, art, 0).status === "richtig";
}

/** Der Hinweis neben dem Feld, wenn gerundet werden muss; sonst "". */
export function rundungsHinweis(art: Art, stellen: number, exakt: Bruch): string {
  const ende = endStellen(exakt);
  if (ende !== null && ende <= stellen) return "";
  const runden = stellen === 0 ? "runde auf eine ganze Zahl" : `runde auf ${stellenText(stellen)}`;
  const satz = art === "geld" ? runden : `${runden} oder gib einen Bruch an`;
  return `${satz.charAt(0).toUpperCase()}${satz.slice(1)}.`;
}

/** Die Lösung, wie man sie eintippt: exakt, wenn sie höchstens sechs Stellen hat, sonst auf `stellen` gerundet. */
export function loesungsText(exakt: Bruch, art: Art, stellen = STELLEN[art]): string {
  const x = zahl(exakt);
  const ende = endStellen(exakt);
  if (art === "geld") return formatWert(runde(x, 2), "€");
  return ende === null ? formatZahl(x, stellen) : formatGenau(x);
}
