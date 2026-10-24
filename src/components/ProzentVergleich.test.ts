// Tests der Übung „Zwei Werte vergleichen“.
import { expect, test } from "vite-plus/test";
import { MELDUNGEN, check, describe, generate, grund, solution, wrong } from "./ProzentVergleich.ts";

test("Aufgabe 1: Ben 168 cm, Mia 192 cm, um wie viel Prozent ist Ben kleiner?", () => {
  const a = generate(1);
  expect(a.text).toBe("Ben ist 168 cm, seine Schwester Mia 192 cm. Um wie viel Prozent ist Ben kleiner als Mia?");
  expect(a.bezug).toBe(192);
  for (const richtig of ["12,5", "12,5 %", "24/192*100"])
    expect(check(a, { prozentsatz: richtig }), richtig).toBe(true);
  // 24 / 168 · 100 ≈ 14,3: die Antwort auf die andere Frage
  expect(grund(a, { prozentsatz: "14,3" })).toBe(MELDUNGEN.bezugVerwechselt);
  expect(grund(a, { prozentsatz: "24" })).toBe(MELDUNGEN.differenzStattProzent);
  expect(grund(a, { prozentsatz: "87,5" })).toBe(MELDUNGEN.verhaeltnisStattUnterschied);
  expect(grund(a, { prozentsatz: "13" })).toBe("Fast – runde auf eine Nachkommastelle.");
});

test("jede Aufgabe: Werte im Bereich, Lösung richtig, Bezug verwechselt falsch", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const a = generate(seed);
    expect(a.bezug).not.toBe(a.vergleich);
    expect(check(a, solution(a))).toBe(true);
    expect(check(a, wrong(a))).toBe(false);
    expect(grund(a, wrong(a))).toBe(MELDUNGEN.bezugVerwechselt);
  }
  expect(describe(generate(1)).task).toContain("? % weniger");
});
