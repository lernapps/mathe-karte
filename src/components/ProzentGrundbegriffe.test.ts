// Tests der Übung „Grundbegriffe erkennen“.
import { expect, test } from "vite-plus/test";
import { MELDUNGEN, check, describe, generate, grund, solution, wrong } from "./ProzentGrundbegriffe.ts";

test("Aufgabe 1: Fahrrad, Rabatt in Euro gegeben, Prozentsatz gesucht", () => {
  const a = generate(1);
  expect(a.text).toBe("Ein Fahrrad kostet 490 €. Der Rabatt beträgt 220,50 €. Wie viel Prozent Rabatt sind das?");
  expect(solution(a)).toEqual({ zahl1: "G", zahl2: "W", gesucht: "p" });
  expect(check(a, { zahl1: "G", zahl2: "W", gesucht: "p" })).toBe(true);
  expect(grund(a, { zahl1: "W", zahl2: "G", gesucht: "p" })).toBe(`${MELDUNGEN.vertauscht} (1 von 3 richtig)`);
  expect(grund(a, { zahl1: "G", zahl2: "p", gesucht: "W" })).toBe(`${MELDUNGEN.falsch} (1 von 3 richtig)`);
  expect(grund(a, { zahl1: "G", zahl2: "W", gesucht: "" })).toBe(
    "Bitte wähle bei jedem Feld etwas aus. (2 von 3 richtig)",
  );
});

test("jede Aufgabe: jede Rolle genau einmal, Lösung richtig, vertauscht falsch", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const a = generate(seed);
    expect(Object.values(solution(a)).sort()).toEqual(["G", "W", "p"]);
    expect(check(a, solution(a))).toBe(true);
    expect(check(a, wrong(a))).toBe(false);
  }
  expect(describe(generate(1)).task).toContain("Zur Wahl:");
});
