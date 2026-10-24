// Use Case: Antwort prüfen (QZ-3, QS-19), Risiko R-025 – Eigenschaften des gemeinsamen Bruchkerns (fast-check):
// gekürzt mit positivem Nenner, Rechengesetze, kaufmännisches Runden auf Nachkommastellen.
import fc from "fast-check";
import { expect, test } from "vite-plus/test";
import { bruch, durch, endStellen, ggT, gleich, mal, minus, NULL, plus, runde } from "./Bruch.ts";

const ganz = fc.integer({ min: -10000, max: 10000 });
const nenner = fc.integer({ min: 1, max: 1000 });
const einBruch = fc.tuple(ganz, nenner).map(([z, n]) => bruch(z, n));

test("jeder Bruch ist gekürzt und hat einen positiven Nenner", () => {
  fc.assert(
    fc.property(
      ganz,
      fc.integer({ min: -1000, max: 1000 }).filter((n) => n !== 0),
      (z, n) => {
        const b = bruch(z, n);
        expect(b.n).toBeGreaterThan(0);
        expect(ggT(b.z, b.n)).toBe(1);
        expect(b.z * n === z * b.n).toBe(true);
      },
    ),
  );
});

test("Rechengesetze: a + b = b + a, a − a = 0, (a · b) : b = a", () => {
  fc.assert(
    fc.property(einBruch, einBruch, (a, b) => {
      expect(gleich(plus(a, b), plus(b, a))).toBe(true);
      expect(gleich(minus(a, a), NULL)).toBe(true);
      if (b.z !== 0) expect(gleich(durch(mal(a, b), b), a)).toBe(true);
    }),
  );
});

test("runde(a, d) liegt höchstens eine halbe Einheit der d-ten Stelle neben a, endet nach d Stellen, bleibt beim zweiten Runden", () => {
  fc.assert(
    fc.property(einBruch, fc.integer({ min: 0, max: 4 }), (a, d) => {
      const r = runde(a, d);
      const abstand = minus(r, a);
      expect(2 * Math.abs(abstand.z) * 10 ** d).toBeLessThanOrEqual(abstand.n);
      expect(endStellen(r)).toBeLessThanOrEqual(d);
      expect(gleich(runde(r, d), r)).toBe(true);
    }),
  );
});
