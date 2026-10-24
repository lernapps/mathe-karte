// Use Case: Prozentrechnung üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel prozent).
// Tests des Rechenkerns: Brüche, Zufall, Schreibweise, Eingaben lesen und die Rundungsregel.
import fc from "fast-check";
import { describe, expect, test } from "vite-plus/test";
import { type Bruch, plus, runde as rundeExakt } from "./Bruch.ts";
import {
  alsBruch,
  bruch,
  erzeugeZufall,
  formatWert,
  leseEingabe,
  loesungsText,
  mitEinheit,
  passtZu,
  pruefeZahl,
  rundungsHinweis,
} from "./ProzentKern.ts";

describe("Brüche", () => {
  test("kürzen und Dezimalzahlen exakt", () => {
    expect(bruch(6, -4)).toEqual({ z: -3, n: 2 });
    expect(alsBruch(12.5)).toEqual({ z: 25, n: 2 });
    expect(alsBruch(-0.75)).toEqual({ z: -3, n: 4 });
  });
});

describe("Zufall", () => {
  test("dieselbe Nummer gibt dieselben Zahlen, andere Übung andere", () => {
    const zahlen = (salz: string) => {
      const z = erzeugeZufall(7, salz);
      return [z.ganzzahl(1, 1000), z.ganzzahl(1, 1000), z.ganzzahl(1, 1000)];
    };
    expect(zahlen("a")).toEqual(zahlen("a"));
    expect(zahlen("a")).not.toEqual(zahlen("b"));
  });
});

describe("Schreibweise", () => {
  test("Geld mit Cent, ganze Beträge ohne Komma, geschütztes Leerzeichen", () => {
    expect(formatWert(780.5, "€")).toBe("780,50");
    expect(formatWert(250, "€")).toBe("250");
    expect(mitEinheit(12.5, "%")).toBe("12,5 %");
  });
});

describe("Eingaben lesen", () => {
  test("Komma, Punkt, Einheit, Tausenderpunkte, Terme", () => {
    expect(leseEingabe("12,5")).toEqual({ typ: "dezimal", wert: { z: 25, n: 2 }, stellen: 1 });
    expect(leseEingabe("30 €", "geld")).toMatchObject({ typ: "dezimal", wert: { z: 30, n: 1 } });
    expect(leseEingabe("1.250,50")).toMatchObject({ wert: { z: 2501, n: 2 } });
    expect(leseEingabe("250*12/100")).toMatchObject({ typ: "term", wert: { z: 30, n: 1 } });
    expect(leseEingabe("(80 − 20) : 4")).toMatchObject({ typ: "term", wert: { z: 15, n: 1 } });
    expect(leseEingabe("3 1/3").typ).toBe("gemischt");
    expect(leseEingabe("").typ).toBe("leer");
    expect(leseEingabe("zwölf").typ).toBe("ungueltig");
  });
  test("% heißt außerhalb des Prozentfelds Hundertstel", () => {
    expect(leseEingabe("12 %", "zahl")).toMatchObject({ wert: { z: 3, n: 25 }, stellen: 2 });
    expect(leseEingabe("12 %", "prozent")).toMatchObject({ wert: { z: 12, n: 1 } });
  });
});

describe("Rundungsregel", () => {
  const drittel = bruch(100, 3);
  test("exakt oder richtig gerundet ist richtig, abgeschnitten falsch", () => {
    expect(pruefeZahl("33,3", drittel, "prozent").status).toBe("richtig");
    expect(pruefeZahl("33,33", drittel, "prozent").status).toBe("richtig");
    expect(pruefeZahl("100/3", drittel, "prozent").status).toBe("richtig");
    expect(pruefeZahl("33,4", drittel, "prozent").status).toBe("falsch");
    expect(pruefeZahl("66,67", bruch(200, 3), "zahl").status).toBe("richtig");
    expect(pruefeZahl("66,66", bruch(200, 3), "zahl").status).toBe("falsch");
  });
  test("zu grob gerundet ist ein Hinweis, leer eine Bitte", () => {
    expect(pruefeZahl("33", drittel, "prozent")).toEqual({
      status: "hinweis",
      meldung: "Fast – runde auf eine Nachkommastelle.",
    });
    expect(pruefeZahl("", drittel, "prozent").status).toBe("leer");
  });
  test("Geld: Terme auf den Cent", () => {
    expect(pruefeZahl("100/3", bruch(100, 3), "geld").status).toBe("richtig");
    expect(pruefeZahl("33,33", bruch(100, 3), "geld").status).toBe("richtig");
    expect(pruefeZahl("33,3", bruch(100, 3), "geld").status).toBe("hinweis");
  });
  test("Diagnose: passt zu einem Wert, 0 nur zu 0", () => {
    expect(passtZu("3000", bruch(3000), "zahl")).toBe(true);
    expect(passtZu("0", bruch(1, 4), "zahl")).toBe(false);
    expect(passtZu("0,13", bruch(1, 8), "zahl")).toBe(true);
  });
  test("Hinweis neben dem Feld und Lösungstext", () => {
    expect(rundungsHinweis("prozent", 1, bruch(25, 2))).toBe("");
    expect(rundungsHinweis("prozent", 1, drittel)).toBe("Runde auf eine Nachkommastelle oder gib einen Bruch an.");
    expect(rundungsHinweis("geld", 2, bruch(100, 3))).toBe("Runde auf zwei Nachkommastellen.");
    expect(loesungsText(drittel, "prozent")).toBe("33,3");
    expect(loesungsText(bruch(147, 2), "geld")).toBe("73,50");
    expect(loesungsText(bruch(9, 8), "zahl")).toBe("1,125");
  });
});

// Use Case: Antwort prüfen (QZ-3, QS-6/QS-7), Risiko R-025 – die Rundungsregel über beliebige Werte (fast-check).
describe("Eigenschaften der Rundungsregel", () => {
  // ein Prozentwert G · p / 100 mit G und p aus den Bereichen der Aufgaben
  const wert = fc
    .tuple(fc.integer({ min: 1, max: 5000 }), fc.integer({ min: 1, max: 999 }))
    .map(([g, p10]) => bruch(g * p10, 1000));
  const kommaText = (b: Bruch, d: number): string => {
    const r = rundeExakt(b, d);
    const ganz = Math.trunc(r.z / r.n);
    const rest = Math.round(((r.z % r.n) / r.n) * 10 ** d);
    return d === 0 ? String(ganz) : `${ganz},${String(rest).padStart(d, "0")}`;
  };

  test("der exakte Bruch und der richtig gerundete Wert mit genug Stellen sind richtig", () => {
    fc.assert(
      fc.property(wert, fc.integer({ min: 2, max: 6 }), (w, d) => {
        expect(pruefeZahl(`${w.z}/${w.n}`, w, "zahl").status).toBe("richtig");
        expect(pruefeZahl(kommaText(w, d), w, "zahl").status).toBe("richtig");
      }),
    );
  });

  test("ein um eine Einheit der letzten Stelle verschobener Wert ist falsch", () => {
    fc.assert(
      fc.property(wert, fc.integer({ min: 2, max: 4 }), (w, d) => {
        const daneben = plus(rundeExakt(w, d), bruch(1, 10 ** d));
        expect(pruefeZahl(kommaText(daneben, d), w, "zahl").status).toBe("falsch");
      }),
    );
  });
});
