// Use Case: Wahrscheinlichkeit üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel zufall).
import { describe, expect, test } from "vite-plus/test";
import { check, describe as beschreibe, generate, grund, solution, wrong } from "./ZufallBaumLuecken.ts";
import { text } from "./ZufallBruch.ts";

describe("Baumdiagramm mit Lücken", () => {
  test("Lösung richtig, Unsinn falsch, 2 bis 4 Lücken", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const a = generate(seed);
      expect(a.luecken.length).toBeGreaterThanOrEqual(2);
      expect(a.luecken.length).toBeLessThanOrEqual(4);
      expect(a.luecken.some((l) => l.id.length >= 2)).toBe(true);
      expect(check(a, solution(a))).toBe(true);
      expect(check(a, wrong(a))).toBe(false);
    }
  });
  test("ungekürzte Brüche zählen", () => {
    const a = generate(4);
    const roh = Object.fromEntries(a.luecken.map((l) => [l.buchstabe, `${l.anzahl}/${l.gesamt}`]));
    expect(check(a, roh)).toBe(true);
  });
  test("nennt die falschen Zweige und den vergessenen kleineren Nenner", () => {
    let gefunden = false;
    for (let seed = 1; seed <= 200 && !gefunden; seed++) {
      const a = generate(seed);
      const l = a.luecken.find((x) => text(x.voll) !== text(x.loesung));
      if (l === undefined) continue;
      gefunden = true;
      const antwort = { ...solution(a), [l.buchstabe]: text(l.voll) };
      expect(grund(a, antwort)).toBe(
        `Noch nicht richtig: ${l.buchstabe}. Ohne Zurücklegen fehlt nach jedem Zug eine Kugel: Der Nenner wird kleiner.`,
      );
    }
    expect(gefunden).toBe(true);
    const a = generate(1);
    expect(grund(a, wrong(a))).toMatch(/nie größer als 1/);
    expect(grund(a, solution(a))).toBe("");
  });
  test("Beschreibung listet die Felder", () => {
    const d = beschreibe(generate(1));
    expect(d.task).toContain("a) ");
    expect(d.solution).toContain("→");
  });
});
