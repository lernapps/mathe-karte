// Exakte Brüche für die Wahrscheinlichkeiten des Kapitels Zufall und das Lesen einer Antwort: ein Bruch (3/8), eine
// Dezimalzahl (0,38), Prozent (37,5 %) oder ein Rechenterm (3/6*2/5, 1-(5/6)^3). Ein Bruch oder Term zählt exakt; eine
// Dezimalzahl oder Prozentangabe ist richtig, wenn sie den Wert exakt trifft oder auf mindestens zwei Nachkommastellen
// richtig gerundet ist (die Rundungsregel der alten App). Rein, ohne DOM; kein eval.

import { type Bruch, bruch, durch, endStellen, gleich, hoch, mal, minus, plus, runde, text, zahl } from "./Bruch.ts";

export * from "./Bruch.ts";

/** Wie viele Nachkommastellen eine gerundete Dezimalzahl mindestens haben muss. */
export const STELLEN = 2;

/** Eine Dezimalzahl in deutscher Schreibweise, auf höchstens `stellen` Stellen. */
export function dezimal(a: Bruch, stellen = 3): string {
  const r = runde(a, stellen);
  return String(zahl(r)).replace(".", ",");
}

/** „1/4 = 0,25 = 25 %“, „1/3 ≈ 0,333 ≈ 33,3 %“: „=“ nur, wenn die Anzeige exakt ist. */
export function alleFormen(a: Bruch): string {
  const ende = endStellen(a);
  const prozent = mal(a, bruch(100));
  return `${text(a)} ${ende <= 3 ? "=" : "≈"} ${dezimal(a, 3)} ${ende <= 3 ? "=" : "≈"} ${dezimal(prozent, 1)} %`;
}

// --- Lesen ----------------------------------------------------------------------------------------------------------

/** Eine gelesene Antwort: ihr exakter Wert, ob sie eine Dezimal- oder Prozentzahl ist, und ihre Nachkommastellen. */
export interface Lesung {
  wert: Bruch;
  dezimal: boolean;
  stellen: number;
}

type Token = { art: "zahl"; text: string } | { art: "prozent" } | { art: "op"; text: string };

const HOCHZAHLEN: Readonly<Record<string, string>> = { "²": "^2", "³": "^3", "⁴": "^4" };

function zerlege(eingabe: string): Token[] | undefined {
  const s = eingabe.replace(/[²³⁴]/g, (c) => HOCHZAHLEN[c] ?? c).replace(/−/g, "-");
  const muster = /\s*(?:(\d+(?:[.,]\d+)?)|(%)|([-+*/:·×^()]))/y;
  const tokens: Token[] = [];
  let pos = 0;
  while (pos < s.length) {
    muster.lastIndex = pos;
    const m = muster.exec(s);
    if (m === null) return s.slice(pos).trim() === "" ? tokens : undefined;
    pos = muster.lastIndex;
    if (m[1] !== undefined) tokens.push({ art: "zahl", text: m[1] });
    else if (m[2] !== undefined) tokens.push({ art: "prozent" });
    else tokens.push({ art: "op", text: m[3] ?? "" });
  }
  return tokens;
}

class Unlesbar extends Error {}
const MAX_WERT = 1e12;

function sicher(b: Bruch): Bruch {
  if (Math.abs(b.z) > MAX_WERT || b.n > MAX_WERT) throw new Unlesbar("zu groß");
  return b;
}

/** Rekursiver Abstieg: ausdruck = term (± term)*, term = faktor (·/ faktor)*, faktor = basis (^ ganzzahl)?. */
function werte(tokens: readonly Token[]): { wert: Bruch; stellen: number } {
  let i = 0;
  let stellen = -1;
  const istOp = (t: string) => {
    const token = tokens[i];
    return token?.art === "op" && token.text === t;
  };
  const basis = (): Bruch => {
    const token = tokens[i];
    if (token === undefined) throw new Unlesbar("Ende");
    if (istOp("-")) {
      i++;
      const b = basis();
      return bruch(-b.z, b.n);
    }
    if (istOp("(")) {
      i++;
      const a = ausdruck();
      if (!istOp(")")) throw new Unlesbar("Klammer");
      i++;
      return a;
    }
    if (token.art !== "zahl") throw new Unlesbar("Zahl erwartet");
    i++;
    const [ganz = "0", teil = ""] = token.text.split(/[.,]/);
    let wert = bruch(Number(ganz + teil), 10 ** teil.length);
    let eigene = teil.length;
    if (tokens[i]?.art === "prozent") {
      i++;
      wert = bruch(wert.z, wert.n * 100);
      eigene += 2;
    }
    if (eigene > 0) stellen = Math.max(stellen, eigene);
    return wert;
  };
  const faktor = (): Bruch => {
    const b = basis();
    if (!istOp("^")) return b;
    i++;
    const e = tokens[i];
    if (e?.art !== "zahl" || !/^\d+$/.test(e.text) || Number(e.text) > 12) throw new Unlesbar("Hochzahl");
    i++;
    return sicher(hoch(b, Number(e.text)));
  };
  const term = (): Bruch => {
    let a = faktor();
    for (;;) {
      const token = tokens[i];
      if (token?.art !== "op" || !"*/:·×".includes(token.text)) return a;
      i++;
      const b = faktor();
      if (token.text === "/" || token.text === ":") {
        if (b.z === 0) throw new Unlesbar("durch null");
        a = sicher(durch(a, b));
      } else a = sicher(mal(a, b));
    }
  };
  const ausdruck = (): Bruch => {
    let a = term();
    while (istOp("+") || istOp("-")) {
      const plusZeichen = istOp("+");
      i++;
      const b = term();
      a = sicher(plusZeichen ? plus(a, b) : minus(a, b));
    }
    return a;
  };
  const wert = ausdruck();
  if (i !== tokens.length) throw new Unlesbar("Rest");
  return { wert, stellen };
}

/** Liest eine Antwort; undefined, wenn sie kein Bruch, keine Zahl und kein Term ist. */
export function lies(eingabe: string): Lesung | undefined {
  const s = eingabe.trim();
  if (s === "") return undefined;
  const tokens = zerlege(s);
  if (tokens === undefined || tokens.length === 0) return undefined;
  try {
    const { wert, stellen } = werte(tokens);
    const einfach =
      tokens.length <= 2 && tokens[0]?.art === "zahl" && (tokens.length === 1 || tokens[1]?.art === "prozent");
    return { wert, dezimal: einfach, stellen: Math.max(stellen, 0) };
  } catch {
    return undefined;
  }
}

/** Was eine Antwort im Vergleich mit dem exakten Wert ist. */
export type Urteil = "richtig" | "gerundet" | "zu-grob" | "falsch" | "unlesbar";

/**
 * Das Urteil über eine Antwort zu `loesung`: richtig (exakt), gerundet (Dezimalzahl auf mindestens zwei Stellen richtig
 * gerundet), zu-grob (richtig gerundet, aber auf weniger als zwei Stellen), falsch oder unlesbar.
 */
export function urteil(eingabe: string, loesung: Bruch): Urteil {
  const l = lies(eingabe);
  if (l === undefined) return "unlesbar";
  if (gleich(l.wert, loesung)) return "richtig";
  // eine ganze Zahl (0 oder 1) ist nie „fast richtig“, auch wenn die Lösung so gerundet wäre
  if (!l.dezimal || l.stellen < 1 || l.stellen > 9 || !gleich(l.wert, runde(loesung, l.stellen))) return "falsch";
  return l.stellen >= STELLEN ? "gerundet" : "zu-grob";
}

/** Ob die Antwort zählt: exakt oder richtig gerundet. */
export const stimmt = (eingabe: string, loesung: Bruch): boolean =>
  ["richtig", "gerundet"].includes(urteil(eingabe, loesung));

/** Ob die Antwort den Wert `b` trifft, exakt oder gerundet (für Fehlerdiagnosen); eine gerundete 0 zählt nicht. */
export function trifft(eingabe: string, b: Bruch): boolean {
  const l = lies(eingabe);
  if (l === undefined) return false;
  if (gleich(l.wert, b)) return true;
  return l.dezimal && l.stellen >= 1 && l.stellen <= 9 && l.wert.z !== 0 && gleich(l.wert, runde(b, l.stellen));
}

export const MELDUNG_UNLESBAR =
  "Das kann ich nicht lesen. Schreib einen Bruch wie 1/6, eine Dezimalzahl wie 0,17 oder Prozent wie 17 %.";
export const MELDUNG_ZU_GROB = "Fast – runde auf zwei Nachkommastellen oder gib einen Bruch an.";

/** Die allgemeine Meldung zu einem Urteil, das kein Fehler mit eigener Diagnose ist; leer bei richtig. */
export function meldung(u: Urteil): string {
  if (u === "unlesbar") return MELDUNG_UNLESBAR;
  if (u === "zu-grob") return MELDUNG_ZU_GROB;
  return "";
}
