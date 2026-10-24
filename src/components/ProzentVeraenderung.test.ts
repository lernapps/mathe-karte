// Use Case: Prozentrechnung üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel prozent).
// Tests der Übung „Prozentuale Zunahme und Abnahme“.
import { expect, test } from "vite-plus/test";
import { MELDUNGEN, check, describe, generate, grund, solution, wrong } from "./ProzentVeraenderung.ts";

test("Aufgabe 1: Nettopreis aus 714 € brutto", () => {
  const a = generate(1);
  expect(a.typ).toBe("alt");
  expect(check(a, { alt: "600" })).toBe(true);
  expect(check(a, { alt: "714/1,19" })).toBe(true);
  // 19 % vom neuen Preis abgezogen: 714 · 0,81 = 578,34
  expect(grund(a, { alt: "578,34" })).toBe(MELDUNGEN.grundwertNeuerWert);
  expect(grund(a, { alt: "595" })).toBe(MELDUNGEN.falsch);
});

test("Aufgabe 3: Hose für 60 € mit 35 % Rabatt", () => {
  const a = generate(3);
  expect(a.text).toBe("Eine Hose kostet 60 €. Im Ausverkauf gibt es 35 % Rabatt. Wie viel kostet sie jetzt?");
  expect(check(a, { neu: "39" })).toBe(true);
  expect(grund(a, { neu: "81" })).toBe(MELDUNGEN.richtungVerwechselt);
  expect(grund(a, { neu: "21" })).toBe(MELDUNGEN.nurProzentwert);
});

test("jede Aufgabe: Lösung richtig, typischer Fehler falsch, der gesuchte Balken bleibt offen", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const a = generate(seed);
    expect(check(a, solution(a))).toBe(true);
    expect(check(a, wrong(a))).toBe(false);
    expect(a.bild.art === "balken" && a.bild.balken.some((b) => b.wert === null)).toBe(true);
    if (a.richtung === "minus") expect(a.neu).toBeLessThan(a.alt);
    else expect(a.neu).toBeGreaterThan(a.alt);
  }
  expect(describe(generate(1)).solution).toContain("714 : 1,19 = 600 €");
});
