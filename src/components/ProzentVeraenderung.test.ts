// Use Case: Prozentrechnung üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel prozent).
// Tests der Übung „Prozentuale Zunahme und Abnahme“.
import { expect, test } from "vite-plus/test";
import { fuelle } from "./ProzentAufgabe.ts";
import * as tabelle from "./ProzentVeraenderung.ts";
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

test("für den Tutor: der Text aus Fassung und Werten, typische Fehler mit ihrer Meldung, Antworten als Text", () => {
  const { MELDUNGEN, about, check, fassungen, generate, mistakes, params, reason, show, solution, template } = tabelle;
  const meldungen: string[] = Object.values(MELDUNGEN);
  expect(template()).toContain("{Fassung}");
  for (let seed = 1; seed <= 67; seed++) {
    const aufgabe = generate(seed);
    const werte = params(aufgabe);
    expect(fuelle(fassungen()[werte["Fassung"] ?? ""] ?? "", werte)).toBe(aufgabe.text);
    expect(show(solution(aufgabe), aufgabe)).not.toBe("");
    const fehler = mistakes(aufgabe);
    expect(fehler).toHaveLength(about.mistakes.length);
    fehler.forEach((antwort, i) => {
      if (antwort === undefined) return;
      expect(check(aufgabe, antwort)).toBe(false);
      const meldung = reason(aufgabe, antwort, undefined, "de");
      const text = about.mistakes[i] ?? "";
      if (text !== MELDUNGEN.falsch) expect(meldung, `Nr. ${seed}, Fehler ${i}`).not.toBe(MELDUNGEN.falsch);
      // die Meldung eines typischen Fehlers; liegen zwei auf derselben Zahl, die des ersten
      expect(meldungen.some((m) => meldung.includes(m.split(/[:.]/)[0] ?? m))).toBe(true);
    });
  }
});
