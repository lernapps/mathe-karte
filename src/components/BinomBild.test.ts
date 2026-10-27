// Use Case: Binomische Formeln üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel binom).
// Das Bild zum Beispiel (BinomBild.vue, Logik in BinomBild.ts): feste Werte, gelöst gezeichnet, für jede Seite des
// Kapitels; die Texte im Bild sind die Werte des Beispiels auf der Seite.
import { expect, test } from "vite-plus/test";
import { bildZumBeispiel, type BildArt, type BildVorgaben } from "./BinomBild.ts";

const texte = (art: BildArt, vorgaben: BildVorgaben): string[] =>
  bildZumBeispiel(art, vorgaben)
    .formen.filter((f) => f.art === "text")
    .map((f) => f.text);

test("Klammer mal Klammer und erste Formel", () => {
  expect(texte("klammern", { m1: 1, n1: 3, m2: 1, n2: 5 })).toEqual(expect.arrayContaining(["x²", "5x", "3x", "15"]));
  expect(texte("erste", { m: 1, n: 4 })).toEqual(expect.arrayContaining(["x²", "4x", "16", "(x + 4)² = x² + 8x + 16"]));
});

test("zweite und dritte Formel", () => {
  expect(texte("zweite", { m: 1, n: 5 })).toEqual(expect.arrayContaining(["(x − 5)²", "− 5x", "+ 25"]));
  expect(texte("dritte", { m: 1, n: 4 })).toEqual(expect.arrayContaining(["− 16", "umgelegt: (x + 4)(x − 4)"]));
});

test("rückwärts und Kopfrechnen", () => {
  expect(texte("rueckwaerts", { formel: 1, m: 1, n: 3 })).toEqual(
    expect.arrayContaining(["x² + 6x + 9 = (x + 3)²", "3x", "9", "x", "3"]),
  );
  expect(texte("kopfrechnen", { formel: 2, basis: 50, abstand: 1 })).toEqual(
    expect.arrayContaining(["49² = 2401", "− 50", "+ 1"]),
  );
});
