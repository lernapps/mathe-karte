// Tests der Übung „Grundwert berechnen“.
import { expect, test } from "vite-plus/test";
import { MELDUNGEN, check, describe, generate, grund, solution, wrong } from "./ProzentGrundwert.ts";

test("Aufgabe 1: 17 Treffer sind 85 % der Würfe", () => {
  const a = generate(1);
  expect(a.text).toBe("Mia hat 17 Treffer erzielt. Das sind 85 % ihrer Würfe. Wie oft hat sie geworfen?");
  for (const richtig of ["20", "20 Würfe", "17*100/85"]) expect(check(a, { grundwert: richtig }), richtig).toBe(true);
  expect(grund(a, { grundwert: "14,45" })).toBe(MELDUNGEN.prozentwertStattGrundwert);
  expect(grund(a, { grundwert: "0,2" })).toBe(MELDUNGEN.nurEinProzent);
  expect(grund(a, { grundwert: "19" })).toBe(MELDUNGEN.falsch);
});

test("jede Aufgabe: Lösung richtig, typischer Fehler falsch, Grundwert größer als Prozentwert", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const a = generate(seed);
    expect(check(a, solution(a))).toBe(true);
    expect(check(a, wrong(a))).toBe(false);
    // bei p = 10 ist 1 % des Grundwerts zugleich 10 % des Prozentwerts: dann gilt die erste Diagnose
    const erwartet = a.prozentsatz === 10 ? MELDUNGEN.prozentwertStattGrundwert : MELDUNGEN.nurEinProzent;
    expect(grund(a, wrong(a))).toBe(erwartet);
    expect(Number((solution(a)["grundwert"] ?? "").replace(",", "."))).toBeGreaterThan(a.prozentwert);
  }
  expect(describe(generate(1)).task).toContain("100 % = ?");
});
