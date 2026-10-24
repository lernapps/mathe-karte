// Use Case: Binomische Formeln üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel binom).
// Die Übung "Geschickt rechnen" (BinomKopfrechnen.ts): Aufgaben aller drei Formeln, Prüfung von Formel und Ergebnis,
// typische Fehler mit Meldung, das Bild vor und nach dem Prüfen und die Beschreibung für den Tutor.
import { describe, expect, test } from "vite-plus/test";
import {
  about,
  check,
  describe as beschreibe,
  erzeugeKopfAufgabe,
  fehlErgebnisse,
  generate,
  grund,
  kopfBild,
  solution,
  wrong,
} from "./BinomKopfrechnen.ts";

const texte = (
  stand: "neu" | "geprueft" | "geloest",
  a = erzeugeKopfAufgabe(1, { formel: 2, basis: 50, abstand: 1 }),
) =>
  kopfBild(a, stand)
    .formen.filter((f) => f.art === "text")
    .map((f) => f.text);

describe("Aufgaben", () => {
  test("alle drei Formeln kommen vor; Lösung richtig, häufigster Fehler falsch", () => {
    const formeln = new Set<number>();
    for (let seed = 1; seed <= 100; seed++) {
      const a = generate(seed, {});
      formeln.add(a.formel);
      expect(generate(seed, {})).toEqual(a);
      expect(check(a, solution(a))).toBe(true);
      expect(check(a, wrong(a))).toBe(false);
      expect(grund(a, wrong(a))).toMatch(/nicht ganz richtig angewendet/);
      expect(beschreibe(a, {}, "de").solution).toContain(String(a.ergebnis));
    }
    expect([...formeln].sort((a, b) => a - b)).toEqual([1, 2, 3]);
    expect(about.mistakes.length).toBeGreaterThanOrEqual(3);
  });

  test("49² = (50 − 1)² = 2401; 21 · 19 = 399; 102² = 10404", () => {
    const a = erzeugeKopfAufgabe(1, { formel: 2, basis: 50, abstand: 1 });
    expect([a.rechnung, a.formelText, a.ergebnis]).toEqual(["49²", "(50 − 1)²", 2401]);
    expect(erzeugeKopfAufgabe(1, { formel: 3, basis: 20, abstand: 1 }).ergebnis).toBe(399);
    expect(erzeugeKopfAufgabe(1, { formel: 1, basis: 100, abstand: 2 }).ergebnis).toBe(10404);
  });
});

describe("Prüfen", () => {
  const a = erzeugeKopfAufgabe(1, { formel: 2, basis: 50, abstand: 1 });
  test("Formel und Ergebnis müssen stimmen; Leerzeichen sind egal", () => {
    expect(check(a, { formel: "2", ergebnis: " 2401 " })).toBe(true);
    expect(check(a, { formel: "1", ergebnis: "2401" })).toBe(false);
    expect(check(a, { formel: "", ergebnis: "2401" })).toBe(false);
  });
  test("typische Fehler mit ihrer Meldung", () => {
    expect(grund(a, { formel: "", ergebnis: "2401" })).toMatch(/Wähle die Formel/);
    expect(grund(a, { formel: "1", ergebnis: "2401" })).toMatch(/knapp unter/);
    expect(grund(a, { formel: "2", ergebnis: "2499" })).toMatch(/50² − 2 · 50 · 1 \+ 1²/);
    expect(grund(a, { formel: "2", ergebnis: "2.401" })).toMatch(/ohne Punkt/);
    expect(grund(a, { formel: "2", ergebnis: "2300" })).toMatch(/glatte Zahl/);
    expect(fehlErgebnisse(a)).toContain(2499);
    expect(fehlErgebnisse(a)).not.toContain(2401);
    const b = erzeugeKopfAufgabe(1, { formel: 3, basis: 20, abstand: 1 });
    expect(grund(b, { formel: "3", ergebnis: "401" })).toMatch(/20² − 1²/);
    expect(grund(b, { formel: "2", ergebnis: "399" })).toMatch(/3\. Formel/);
  });
});

describe("Bild", () => {
  test("vor dem Prüfen neutral, nach dem Prüfen mit Rechnungen, gelöst mit Werten", () => {
    expect(texte("neu")).toContain("49² = ?");
    expect(texte("neu").join(" ")).not.toContain("50");
    expect(texte("geprueft").join(" ")).toContain("50 · 1");
    expect(texte("geloest")).toContain("49² = 2401");
  });
});
