// Use Case: Prozentrechnung üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel prozent).
// Tests der Übung „Prozentwert berechnen“: andere richtige Schreibweisen, typische Fehler mit Grund, Zahlenbereiche.
import { expect, test } from "vite-plus/test";
import { MELDUNGEN, about, check, describe, generate, grund, solution, wrong } from "./ProzentProzentwert.ts";

const SEEDS = Array.from({ length: 200 }, (_, i) => i + 1);

test("Aufgabe 1: Fahrrad für 1245 €, 6 % Rabatt", () => {
  const a = generate(1);
  expect(a.text).toBe("Ein Fahrrad kostet 1245 €. Im Angebot gibt es 6 % Rabatt. Wie viel Euro sparst du?");
  for (const richtig of ["74,70", "74,7", "74.70 €", "1245*6/100", "1245 · 6 : 100"]) {
    expect(check(a, { prozentwert: richtig }), richtig).toBe(true);
  }
  expect(grund(a, { prozentwert: "7470" })).toBe("Du hast vergessen, durch 100 zu teilen: 6 % sind 6/100 = 0,06.");
  expect(grund(a, { prozentwert: "1170,30" })).toBe(MELDUNGEN.restStattAnteil);
  expect(grund(a, { prozentwert: "75" })).toBe("Fast – runde auf zwei Nachkommastellen.");
  expect(grund(a, { prozentwert: "" })).toBe("Bitte gib eine Zahl ein, zum Beispiel 12,5.");
  expect(grund(a, { prozentwert: "80" })).toBe(MELDUNGEN.falsch);
});

test("jede Aufgabe: gleich für dieselbe Nummer, Lösung richtig, typischer Fehler falsch, Zahlen plausibel", () => {
  for (const seed of SEEDS) {
    const a = generate(seed);
    expect(generate(seed)).toEqual(a);
    expect(check(a, solution(a))).toBe(true);
    expect(check(a, wrong(a))).toBe(false);
    expect(grund(a, wrong(a))).toMatch(/vergessen, durch 100 zu teilen/);
    expect(a.grundwert).toBeGreaterThan(0);
    if (/Klasse|Treffer|Personen/.test(a.text)) expect(Number.isInteger(Number(solution(a)["prozentwert"]))).toBe(true);
    // das Bild verrät den Prozentwert erst nach der Lösung
    expect(JSON.stringify(a.bild)).not.toContain(`= ${solution(a)["prozentwert"]}`);
  }
});

test("Beschreibung für Tutor und Seite ohne JavaScript", () => {
  const { task, solution: loesung } = describe(generate(1));
  expect(task).toContain("Bild zur Aufgabe: Hunderterfeld: 6 von 100 Kästchen sind blau.");
  expect(loesung).toContain("Prozentwert W: 74,70 €");
  expect(about.mistakes).toHaveLength(2);
});
