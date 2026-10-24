// Die Übung mit Termeingabe (BinomTermAufgabe.ts): je Art die Aufgaben, andere richtige Schreibweisen, die typischen
// Fehler mit ihrer Meldung, Randfälle und die Beschreibung für Tutor und Seite ohne JavaScript.
import { describe, expect, test } from "vite-plus/test";
import { erzeugeTermAufgabe, type Art, type TermAufgabe } from "./BinomFormeln.ts";
import { termBild } from "./BinomBilder.ts";
import { erzeugeZufall } from "./BinomTerm.ts";
import {
  about,
  check,
  describe as beschreibe,
  generate,
  grund,
  solution,
  vorschau,
  wrong,
} from "./BinomTermAufgabe.ts";

const ARTEN: Art[] = ["klammern", "erste", "zweite", "dritte", "rueckwaerts"];
const fest = (art: Art, vorgaben: Parameters<typeof erzeugeTermAufgabe>[2]): TermAufgabe =>
  erzeugeTermAufgabe(art, erzeugeZufall(1), vorgaben);
/** Die erste Aufgabennummer, deren Aufgabe passt. */
function finde(art: Art, passt: (a: TermAufgabe) => boolean): TermAufgabe {
  for (let seed = 1; seed < 500; seed++) {
    const a = generate(seed, { art });
    if (passt(a)) return a;
  }
  throw new Error(`keine Aufgabe für ${art}`);
}

describe("für jede Art und viele Aufgabennummern", () => {
  test.each(ARTEN)("%s: gleiche Nummer, gleiche Aufgabe; Lösung richtig, Fehlterm falsch mit Grund", (art) => {
    for (let seed = 1; seed <= 120; seed++) {
      const a = generate(seed, { art });
      expect(generate(seed, { art })).toEqual(a);
      expect(check(a, solution(a)), `${seed} ${a.term}`).toBe(true);
      expect(grund(a, solution(a))).toBe("");
      expect(check(a, wrong(a)), `${seed} ${a.term}`).toBe(false);
      expect(grund(a, wrong(a)).length).toBeGreaterThan(10);
      expect(a.schritte.length).toBeGreaterThanOrEqual(3);
      const { task, solution: loesung } = beschreibe(a, { art }, "de");
      expect(task).toContain("$");
      expect(loesung).toContain("$");
      expect(termBild(a, false).formen.length).toBeGreaterThan(5);
    }
  });

  test("about nennt Aufgabe, Antwort, was zählt und Fehler", () => {
    expect(about.mistakes.length).toBeGreaterThanOrEqual(3);
  });
});

describe("Klammer mal Klammer", () => {
  const a = fest("klammern", { m1: 2, n1: 1, m2: 1, n2: 4 }); // (2x + 1)(x + 4) = 2x² + 9x + 4
  test("andere richtige Schreibweisen zählen", () => {
    expect(a.term).toBe("(2x + 1)(x + 4)");
    for (const e of ["2x^2+9x+4", "4 + 9x + 2x²", "2x² + 9·x + 4", "2*x^2+9x+4"]) expect(check(a, e), e).toBe(true);
  });
  test("nur außen, Vorzeichen, nicht ausmultipliziert, nicht zusammengefasst", () => {
    expect(grund(a, "2x^2+4")).toMatch(/gemischten Glieder/);
    expect(grund(a, "2x^2-9x+4")).toMatch(/Vorzeichen/);
    expect(grund(a, "(2x+1)(x+4)")).toMatch(/ausmultiplizieren/);
    expect(grund(a, "2x^2+8x+x+4")).toMatch(/zusammen/);
    expect(grund(a, "2x^2+")).toMatch(/unvollständig/);
    expect(grund(a, "x^2+1")).toMatch(/vier Produkte/);
  });
});

describe("erste binomische Formel", () => {
  const a = fest("erste", { m: 3, n: 2 }); // (3x + 2)² = 9x² + 12x + 4
  test("Aufgabe und Lösung", () => {
    expect(a.term).toBe("(3x + 2)²");
    expect(a.loesung).toBe("9x^2+12x+4");
    expect(check(a, "4 + 12x + 9x^2")).toBe(true);
  });
  test("Mittelglied vergessen, nur einmal ab, Zahl nicht quadriert", () => {
    expect(grund(a, "9x^2+4")).toMatch(/fehlt das Mittelglied 2ab/);
    expect(grund(a, "9x^2+6x+4")).toMatch(/zweimal/);
    expect(grund(a, "3x^2+12x+4")).toMatch(/\(3x\)² = 9x²/);
    expect(grund(a, "(3x+2)^2")).toMatch(/ausmultiplizieren/);
  });
});

describe("zweite binomische Formel", () => {
  const a = fest("zweite", { m: 1, n: 5 }); // (x − 5)² = x² − 10x + 25
  test("typische Vorzeichenfehler", () => {
    expect(a.term).toBe("(x − 5)²");
    expect(check(a, "x^2-10x+25")).toBe(true);
    expect(grund(a, "x^2-25")).toMatch(/fehlt das Mittelglied/);
    expect(grund(a, "x^2-10x-25")).toMatch(/Minus mal Minus/);
    expect(grund(a, "x^2-5x+25")).toMatch(/zweimal/);
    expect(grund(a, "x^2+10x+25")).toMatch(/erste Formel/);
  });
});

describe("dritte binomische Formel", () => {
  const a = fest("dritte", { m: 1, n: 4 }); // (x + 4)(x − 4) = x² − 16
  test("kein Mittelglied, Minus bleibt", () => {
    expect(a.term).toBe("(x + 4)(x − 4)");
    expect(check(a, "-16+x^2")).toBe(true);
    expect(grund(a, "x^2+8x-16")).toMatch(/kein Mittelglied/);
    expect(grund(a, "x^2+16")).toMatch(/Achte auf das Minus/);
  });
  test("beide Reihenfolgen der Klammern kommen vor", () => {
    const plusVorn = (seed: number): boolean =>
      generate(seed, { art: "dritte" }).term.split(")")[0]?.includes("+") ?? false;
    expect(new Set(Array.from({ length: 60 }, (_, i) => plusVorn(i + 1))).size).toBe(2);
  });
});

describe("Binome rückwärts", () => {
  test("faktorisieren: alle Schreibweisen eines Binom-Produkts zählen", () => {
    const a = fest("rueckwaerts", { formel: 1, m: 1, n: 3 }); // x² + 6x + 9 = (x + 3)²
    expect(a.term).toBe("x² + 6x + 9");
    for (const e of ["(x+3)^2", "(x+3)²", "(3+x)^2", "(x+3)(x+3)"]) expect(check(a, e), e).toBe(true);
    for (const e of ["x^2+6x+9", "1*(x^2+6x+9)", "(x^2+6x+9)"]) {
      expect(check(a, e), e).toBe(false);
      expect(grund(a, e), e).toMatch(/binomische Formel/);
    }
    expect(grund(a, "(x-3)^2")).toMatch(/Vorzeichen des Mittelglieds/);
    expect(grund(a, "(x+6)^2")).toMatch(/doppelt so groß/);
    expect(grund(a, "(x+3)(x-3)")).toMatch(/hätte kein Mittelglied/);
  });
  test("dritte Formel rückwärts", () => {
    const c = fest("rueckwaerts", { formel: 3, m: 1, n: 4 });
    expect(c.term).toBe("x² − 16");
    expect(check(c, "(x-4)(x+4)")).toBe(true);
    expect(grund(c, "(x-4)^2")).toMatch(/3\. Formel/);
  });
  test("Lücke in der Mitte und am Ende, mit den typischen Fehlern", () => {
    const mitte = finde("rueckwaerts", (a) => a.luecke === "mitte" && a.term.startsWith("x² + □x"));
    const zahl = Number(mitte.loesung);
    expect(check(mitte, ` ${zahl} `)).toBe(true);
    expect(grund(mitte, String(zahl / 2))).toMatch(/Vergiss die 2 nicht/);
    expect(grund(mitte, "2*5")).toMatch(/ganze Zahl/);
    expect(vorschau(mitte, "12")).toBe("");
    const ende = finde("rueckwaerts", (a) => a.luecke === "ende" && a.term.startsWith("x² "));
    const b = Math.sqrt(Number(ende.loesung));
    expect(grund(ende, String(b))).toMatch(/b²/);
    expect(grund(ende, String(4 * b * b))).toMatch(/doppelt so groß/);
    expect(beschreibe(ende, { art: "rueckwaerts" }, "de").task).toContain("\\text{□}");
  });
});

describe("Vorschau der Eingabe", () => {
  test("zeigt, was gelesen wurde, oder die Meldung", () => {
    const a = fest("erste", { m: 1, n: 3 });
    expect(vorschau(a, "x^2+6x+9")).toBe("Gelesen: x² + 6x + 9");
    expect(vorschau(a, "(x+3")).toMatch(/Klammer/);
    expect(vorschau(a, "")).toBe("");
  });
});
