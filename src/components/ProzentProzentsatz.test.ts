// Use Case: Prozentrechnung üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel prozent).
// Tests der Übung „Prozentsatz berechnen“.
import { expect, test } from "vite-plus/test";
import { fuelle } from "./ProzentAufgabe.ts";
import * as tabelle from "./ProzentProzentsatz.ts";
import { MELDUNGEN, check, describe, generate, grund, solution, wrong } from "./ProzentProzentsatz.ts";

test("Aufgabe 1: 9 von 300 Befragten", () => {
  const a = generate(1);
  expect(a.text).toContain("300 Personen wurden befragt, 9 Personen davon");
  for (const richtig of ["3", "3 %", "3,0", "9/300*100"])
    expect(check(a, { prozentsatz: richtig }), richtig).toBe(true);
  expect(grund(a, { prozentsatz: "0,03" })).toBe(MELDUNGEN.dezimalStattProzent);
  expect(grund(a, { prozentsatz: "3333,3" })).toBe(MELDUNGEN.bezugVerwechselt);
  expect(grund(a, { prozentsatz: "4" })).toBe(MELDUNGEN.falsch);
});

test("ein Ergebnis mit Nachkommastelle: 12,5 % (Aufgabe aus Basketball oder Akku)", () => {
  const seed = Array.from({ length: 300 }, (_, i) => i + 1).find(
    (s) => solution(generate(s))["prozentsatz"] === "12,5",
  );
  expect(seed).toBeDefined();
  const a = generate(seed ?? 1);
  expect(check(a, { prozentsatz: "12,5" })).toBe(true);
  expect(check(a, { prozentsatz: "25/2" })).toBe(true);
  expect(grund(a, { prozentsatz: "13" })).toBe("Fast – runde auf eine Nachkommastelle.");
  expect(grund(a, { prozentsatz: "12" })).toBe(MELDUNGEN.falsch);
});

test("jede Aufgabe: Lösung richtig, typischer Fehler falsch, Bild verrät p erst nach der Lösung", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const a = generate(seed);
    expect(check(a, solution(a))).toBe(true);
    expect(check(a, wrong(a))).toBe(false);
    expect(grund(a, wrong(a))).toBe(MELDUNGEN.dezimalStattProzent);
    expect(a.bild.art === "prozentbalken" && a.bild.prozent).toBe(0);
    expect(a.prozentwert).toBeLessThan(a.grundwert);
  }
  expect(describe(generate(1)).task).toContain("? %");
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
