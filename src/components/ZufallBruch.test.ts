// Use Case: Wahrscheinlichkeit üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel zufall).
import fc from "fast-check";
import { describe, expect, test } from "vite-plus/test";
import {
  type Bruch,
  alleFormen,
  bruch,
  gleich,
  lies,
  plus,
  runde,
  stimmt,
  text,
  trifft,
  urteil,
} from "./ZufallBruch.ts";

describe("Brüche", () => {
  test("kürzen und schreiben", () => {
    expect(text(bruch(6, 36))).toBe("1/6");
    expect(text(bruch(4, 2))).toBe("2");
    expect(text(bruch(0, 5))).toBe("0");
    expect(bruch(3, -6)).toEqual({ z: -1, n: 2 });
  });
  test("runden kaufmännisch", () => {
    expect(runde(bruch(1, 6), 2)).toEqual(bruch(17, 100));
    expect(runde(bruch(1, 8), 2)).toEqual(bruch(13, 100));
    expect(runde(bruch(1, 3), 0)).toEqual(bruch(0));
  });
  test("alle Schreibweisen", () => {
    expect(alleFormen(bruch(1, 4))).toBe("1/4 = 0,25 = 25 %");
    expect(alleFormen(bruch(1, 3))).toBe("1/3 ≈ 0,333 ≈ 33,3 %");
  });
});

describe("Antworten lesen", () => {
  test("Bruch, Dezimalzahl, Prozent und Term", () => {
    expect(lies("3/8")?.wert).toEqual(bruch(3, 8));
    expect(lies("0,375")).toEqual({ wert: bruch(3, 8), dezimal: true, stellen: 3 });
    expect(lies("37,5 %")).toEqual({ wert: bruch(3, 8), dezimal: true, stellen: 3 });
    expect(lies("3/6*2/5")?.wert).toEqual(bruch(1, 5));
    expect(lies("3/6 · 2/5 + 2/6 : 5 : 3")?.wert).toEqual(bruch(2, 9));
    expect(lies("1-(5/6)^3")?.wert).toEqual(bruch(91, 216));
    expect(lies("1 − (5/6)³")?.wert).toEqual(bruch(91, 216));
  });
  test("Unlesbares", () => {
    expect(lies("")).toBeUndefined();
    expect(lies("drei")).toBeUndefined();
    expect(lies("1/0")).toBeUndefined();
    expect(lies("(1/2")).toBeUndefined();
    expect(lies("2^99")).toBeUndefined();
  });
});

describe("Urteil nach der Rundungsregel", () => {
  const p = bruch(1, 6);
  test("exakt richtig", () => {
    expect(urteil("1/6", p)).toBe("richtig");
    expect(urteil("2/12", p)).toBe("richtig");
    expect(urteil("3/6*2/6", p)).toBe("richtig");
  });
  test("gerundet auf mindestens zwei Stellen", () => {
    expect(urteil("0,17", p)).toBe("gerundet");
    expect(urteil("0.167", p)).toBe("gerundet");
    expect(urteil("16,7 %", p)).toBe("gerundet");
    expect(stimmt("17 %", p)).toBe(true);
  });
  test("zu grob, abgeschnitten, falsch", () => {
    expect(urteil("0,2", p)).toBe("zu-grob");
    expect(urteil("0,16", p)).toBe("falsch");
    expect(urteil("1/5", p)).toBe("falsch");
    expect(urteil("x", p)).toBe("unlesbar");
  });
  test("trifft für Diagnosen", () => {
    expect(trifft("0,3", bruch(1, 3))).toBe(true);
    expect(trifft("2/6", bruch(1, 3))).toBe(true);
    expect(trifft("0", bruch(1, 6))).toBe(false);
    expect(gleich(bruch(2, 4), bruch(1, 2))).toBe(true);
  });
});

// Use Case: Antwort prüfen (QZ-3, QS-19), Risiko R-025 – Lesen und Urteil über beliebige Wahrscheinlichkeiten.
describe("Eigenschaften des Urteils", () => {
  const p = fc
    .tuple(fc.integer({ min: 1, max: 999 }), fc.integer({ min: 1, max: 999 }))
    .map(([a, b]) => bruch(Math.min(a, b), Math.max(a, b)));
  const komma = (b: Bruch, d: number): string => {
    const r = runde(b, d);
    const rest = Math.round(((r.z % r.n) / r.n) * 10 ** d);
    return `${Math.trunc(r.z / r.n)},${String(rest).padStart(d, "0")}`;
  };

  test("der Bruch selbst, ein ungekürzter Bruch und der Wert auf 2 bis 4 Stellen gerundet stimmen", () => {
    fc.assert(
      fc.property(p, fc.integer({ min: 2, max: 4 }), fc.integer({ min: 2, max: 5 }), (w, d, k) => {
        expect(stimmt(text(w), w)).toBe(true);
        expect(stimmt(`${w.z * k}/${w.n * k}`, w)).toBe(true);
        expect(stimmt(komma(w, d), w)).toBe(true);
      }),
    );
  });

  test("ein um eine Einheit der zweiten Stelle verschobener Wert stimmt nicht", () => {
    fc.assert(
      fc.property(p, (w) => {
        const daneben = plus(runde(w, 2), bruch(1, 100));
        expect(stimmt(komma(daneben, 2), w)).toBe(false);
      }),
    );
  });

  test("lies liest jede Schreibweise des Bruchs als denselben Wert", () => {
    fc.assert(
      fc.property(p, (w) => {
        const gelesen = lies(text(w));
        expect(gelesen !== undefined && gleich(gelesen.wert, w)).toBe(true);
      }),
    );
  });
});
