// Die gemeinsamen Term-Hilfen des Kapitels "Binomische Formeln" (BinomTerm.ts, BinomParser.ts): Polynome bauen und
// schreiben, Terme lesen, Gleichwertigkeit und Form prüfen, Binom-Struktur erkennen, Fehlterme zuordnen.
import { describe, expect, test } from "vite-plus/test";
import { leseTerm } from "./BinomParser.ts";
import {
  addiere,
  alsAnzeige,
  alsEingabe,
  alsLatex,
  diagnose,
  erzeugeZufall,
  glied,
  gliedAnzeige,
  istBinomProdukt,
  leseGanzzahl,
  mal,
  multipliziere,
  pruefeTerm,
  quadratAnzeige,
  schrittMarkdown,
  sindGleichwertig,
  zuLatex,
} from "./BinomTerm.ts";

const x = (k: number) => glied(k, "x");
const zahl = (k: number) => glied(k);

describe("Polynome", () => {
  test("(2x − 1)(x + 4) = 2x² + 7x − 4 in Eingabe-, Anzeige- und LaTeX-Form", () => {
    const p = multipliziere([x(2), zahl(-1)], [x(1), zahl(4)]);
    expect(alsEingabe(p)).toBe("2x^2+7x-4");
    expect(alsAnzeige(p)).toBe("2x² + 7x − 4");
    expect(alsLatex(p)).toBe("2x^2 + 7x - 4");
  });

  test("(3a + 2b)² und (a + b)(a − b); Nullglieder fallen weg", () => {
    const a = glied(3, "a");
    const b = glied(2, "b");
    expect(alsAnzeige(multipliziere([a, b], [a, b]))).toBe("9a² + 12ab + 4b²");
    expect(alsAnzeige(multipliziere([glied(1, "a"), glied(1, "b")], [glied(1, "a"), glied(-1, "b")]))).toBe("a² − b²");
  });

  test("Koeffizient 1 und −1, Vorzeichen, Addieren, leeres Polynom", () => {
    expect(gliedAnzeige(glied(-1, "x", "x"))).toBe("−x²");
    expect(gliedAnzeige(glied(-3))).toBe("−3");
    expect(alsEingabe([glied(-1, "x", "x"), zahl(9)])).toBe("-x^2+9");
    expect(alsAnzeige(addiere([x(1)], [x(2), zahl(-5)]))).toBe("3x − 5");
    expect(alsAnzeige([mal(x(1), -1), zahl(5)])).toBe("−x + 5");
    expect(alsAnzeige([])).toBe("0");
  });

  test("Quadrat eines Glieds als Rechenschritt", () => {
    expect(quadratAnzeige(x(1))).toBe("x²");
    expect(quadratAnzeige(zahl(-4))).toBe("4²");
    expect(quadratAnzeige(glied(3, "a"))).toBe("(3a)²");
  });
});

describe("Terme lesen und prüfen", () => {
  test("liest Hochzahlen, Malzeichen, Minuszeichen und implizite Multiplikation", () => {
    for (const [ein, aus] of [
      ["x^2+6x+9", "x² + 6x + 9"],
      ["x²−6·x+9", "x² − 6x + 9"],
      ["(a+b)(a-b)", "(a + b)(a − b)"],
      ["x*2", "x·2"],
    ] as const) {
      const t = leseTerm(ein);
      expect(t.fehler).toBeUndefined();
      expect(t.baum === undefined ? "" : t.text).toBe(aus);
    }
  });

  test("meldet Syntaxfehler verständlich", () => {
    expect(leseTerm("(x+3").fehler).toBe("klammer-fehlt");
    expect(leseTerm("X^2").fehler).toBe("grossbuchstabe");
    expect(leseTerm("x2").fehler).toBe("zahl-dahinter");
    expect(leseTerm("x+?").fehler).toBe("zeichen");
    expect(leseTerm("   ").fehler).toBe("leer");
  });

  test("Gleichwertigkeit an festen Stellen, unabhängig von Reihenfolge und Schreibweise", () => {
    expect(sindGleichwertig("x^2+6x+9", "(x+3)^2")).toBe(true);
    expect(sindGleichwertig("9 + 6x + x²", "x^2+6x+9")).toBe(true);
    expect(sindGleichwertig("x^2+9", "(x+3)^2")).toBe(false);
    expect(sindGleichwertig("4ab", "4ba")).toBe(true);
    expect(sindGleichwertig("a^2-b^2", "a^2-c^2")).toBe(false);
  });

  test("Form: ausmultipliziert und zusammengefasst, faktorisiert", () => {
    expect(pruefeTerm("x^2+6x+9", "x^2+6x+9", "ausmultipliziert")).toEqual({ korrekt: true });
    expect(pruefeTerm("(x+3)^2", "x^2+6x+9", "ausmultipliziert").fehler).toBe("nicht-ausmultipliziert");
    expect(pruefeTerm("x^2+3x+3x+9", "x^2+6x+9", "ausmultipliziert").fehler).toBe("nicht-zusammengefasst");
    expect(pruefeTerm("x·x+6x+9", "x^2+6x+9", "ausmultipliziert").fehler).toBe("nicht-zusammengefasst");
    expect(pruefeTerm("x^2+6x+9", "(x+3)^2", "faktorisiert").fehler).toBe("nicht-faktorisiert");
    expect(pruefeTerm("x^2+6x+8", "x^2+6x+9", "ausmultipliziert").fehler).toBe("falsch");
    expect(pruefeTerm("x^2+", "x^2+6x+9", "ausmultipliziert").fehler).toBe("kein-term");
  });

  test("Binom-Struktur: (x+3)², (x+4)(x−4), nicht aber 1·(x²+6x+9)", () => {
    for (const t of ["(x+3)^2", "(x+3)²", "(x+4)(x-4)", "(x-4)*(x+4)", "(2a+3b)^2", "(3+x)^2", "((x+3))^2"]) {
      expect(istBinomProdukt(t), t).toBe(true);
    }
    for (const t of [
      "1*(x^2+6x+9)",
      "x^2+6x+9",
      "(x+3)^3",
      "2(x+3)^2",
      "(x+3)(x+3)(x+3)",
      "(x+1+2)^2",
      "x(x+6)",
      "(x+",
    ]) {
      expect(istBinomProdukt(t), t).toBe(false);
    }
  });

  test("diagnose ordnet Fehlterme zu und überspringt Kandidaten, die richtig sind", () => {
    const regeln: [string, string[]][] = [
      ["richtig-ist-kein-fehler", ["(x+3)^2"]],
      ["mittelglied", ["x^2+9"]],
    ];
    expect(diagnose("9+x^2", "x^2+6x+9", regeln)).toBe("mittelglied");
    expect(diagnose("x^2+5x+9", "x^2+6x+9", regeln)).toBe("falsch");
  });

  test("ganze Zahlen lesen, auch mit langem Minus", () => {
    expect(leseGanzzahl(" 12 ")).toBe(12);
    expect(leseGanzzahl("−4")).toBe(-4);
    expect(leseGanzzahl("2*5")).toBeUndefined();
    expect(leseGanzzahl("2,5")).toBeUndefined();
  });
});

describe("Zufall und Rechenweg", () => {
  test("gleiche Nummer, gleiche Zahlen; Zahlen im Bereich", () => {
    const a = erzeugeZufall(7);
    const b = erzeugeZufall(7);
    const folge = Array.from({ length: 20 }, () => a.ganzzahl(1, 9));
    expect(Array.from({ length: 20 }, () => b.ganzzahl(1, 9))).toEqual(folge);
    expect(folge.every((n) => n >= 1 && n <= 9)).toBe(true);
    expect(new Set(Array.from({ length: 30 }, (_, i) => erzeugeZufall(i + 1).wahl([1, 2, 3]))).size).toBe(3);
  });

  test("Rechnungen werden zu LaTeX, Text bleibt Text", () => {
    expect(zuLatex("(2x − 5)² = 4x² − 2 · 2x · 5 + 25")).toBe("(2x - 5)^2 = 4x^2 - 2 \\cdot 2x \\cdot 5 + 25");
    expect(zuLatex("x² + □x")).toBe("x^2 + \\text{□}x");
    expect(schrittMarkdown(["Glieder: ", "a = x, b = 3", " fertig"])).toBe("Glieder: $a = x, b = 3$ fertig");
  });
});
