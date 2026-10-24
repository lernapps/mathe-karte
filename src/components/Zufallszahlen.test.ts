// Use Case: Aufgabe Nr. n (QZ-2, QS-3) – derselbe Startwert gibt dieselbe Folge; Ganzzahl, Wahl und Mischen bleiben
// in ihren Grenzen (fast-check).
import fc from "fast-check";
import { expect, test } from "vite-plus/test";
import { mulberry32, zufallAusFolge } from "./Zufallszahlen.ts";

const start = fc.integer({ min: 0, max: 2 ** 32 - 1 });

test("derselbe Startwert gibt dieselbe Folge, jede Zahl liegt in [0, 1)", () => {
  fc.assert(
    fc.property(start, (s) => {
      const a = mulberry32(s);
      const b = mulberry32(s);
      for (let i = 0; i < 20; i++) {
        const x = a();
        expect(x).toBe(b());
        expect(x >= 0 && x < 1).toBe(true);
      }
    }),
  );
});

test("ganzzahl bleibt in [min, max], wahl wählt aus der Liste, mischen ist eine Umordnung", () => {
  fc.assert(
    fc.property(
      start,
      fc.integer({ min: -50, max: 50 }),
      fc.integer({ min: 0, max: 50 }),
      fc.array(fc.integer(), { minLength: 1, maxLength: 12 }),
      (s, min, breite, liste) => {
        const z = zufallAusFolge(mulberry32(s));
        const g = z.ganzzahl(min, min + breite);
        expect(g >= min && g <= min + breite && Number.isInteger(g)).toBe(true);
        expect(liste).toContain(z.wahl(liste));
        expect([...z.mischen(liste)].sort()).toEqual([...liste].sort());
      },
    ),
  );
});

test("wahl aus einer leeren Liste ist ein Fehler", () => {
  expect(() => zufallAusFolge(mulberry32(1)).wahl([])).toThrow(RangeError);
});
