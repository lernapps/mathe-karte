// Use Case: Prozentrechnung üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel prozent).
// Tests der Übung „Sachaufgaben übersetzen“: beide Typen, Gleichung und Dreisatz.
import { expect, test } from "vite-plus/test";
import { fuelle } from "./ProzentAufgabe.ts";
import * as tabelle from "./ProzentSachaufgaben.ts";
import { MELDUNGEN, check, describe, generate, grund, solution, wrong } from "./ProzentSachaufgaben.ts";

test("Aufgabe 1: Dreisatz mit 2600 mAh und 25 %", () => {
  const a = generate(1);
  expect(a.typ).toBe("dreisatz");
  expect(check(a, { eins: "26", prozent: "650" })).toBe(true);
  expect(check(a, { eins: "2600/100", prozent: "650 mAh" })).toBe(true);
  expect(grund(a, { eins: "26", prozent: "600" })).toBe(MELDUNGEN.falsch);
  expect(grund(a, { eins: "26", prozent: "" })).toBe("Bitte gib eine Zahl ein, zum Beispiel 12,5.");
});

test("Aufgabe 2: Gleichung für den Grundwert", () => {
  const a = generate(2);
  expect(a.typ).toBe("gleichung");
  expect(check(a, { gleichung: "G = 408 · 100 / 80", ergebnis: "510" })).toBe(true);
  expect(grund(a, { gleichung: "G = 408 · 80 / 100", ergebnis: "326,4" })).toBe(MELDUNGEN.gleichungFalsch);
  expect(grund(a, { gleichung: "G = 408 · 100 / 80", ergebnis: "500" })).toBe(MELDUNGEN.ergebnisFalsch);
});

test("jede Aufgabe: Lösung richtig, Falle falsch, beide Typen kommen vor", () => {
  const typen = new Set<string>();
  for (let seed = 1; seed <= 200; seed++) {
    const a = generate(seed);
    typen.add(a.typ);
    expect(check(a, solution(a))).toBe(true);
    expect(check(a, wrong(a))).toBe(false);
    const [erstes] = a.felder;
    if (erstes?.typ === "knoepfe") expect(new Set(erstes.optionen.map((o) => o.wert)).size).toBe(3);
  }
  expect([...typen].sort()).toEqual(["dreisatz", "gleichung"]);
  expect(describe(generate(2)).task).toContain("Zur Wahl:");
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
