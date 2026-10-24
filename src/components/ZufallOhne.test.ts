// Use Case: Wahrscheinlichkeit üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel zufall).
import { describe, expect, test } from "vite-plus/test";
import { check, describe as beschreibe, generate, grund, solution, tipp, wrong } from "./ZufallOhne.ts";
import { bruch, gleich, text } from "./ZufallBruch.ts";

describe("Mit und ohne Zurücklegen", () => {
  test("Lösung richtig, Gegenbeispiel falsch", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const a = generate(seed);
      expect(check(a, solution(a))).toBe(true);
      expect(check(a, wrong(a))).toBe(false);
    }
  });
  test("ohne Zurücklegen wird der Nenner kleiner", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const a = generate(seed);
      if (a.art !== "zweig") continue;
      expect(a.mit).toEqual(bruch(a.anzZ, a.gesamt));
      expect(a.ohne).toEqual(bruch(a.anzZDanach, a.gesamt - 1));
    }
  });
  test("Wert mit statt ohne Zurücklegen", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const a = generate(seed);
      if (gleich(a.mit, a.ohne)) continue;
      expect(grund(a, { mit: text(a.mit), ohne: text(a.mit) })).toBe(
        `Ohne Zurücklegen hast du den Wert mit Zurücklegen genommen. Es fehlt eine Kugel – der Nenner wird kleiner. ${tipp(a)}`,
      );
      expect(grund(a, solution(a))).toBe("");
      return;
    }
  });
  test("Beschreibung mit zwei Feldern", () => {
    const d = beschreibe(generate(1));
    expect(d.task).toContain("(1) ");
    expect(d.task).toContain("(2) ");
    expect(d.solution).toContain("Ohne Zurücklegen");
  });
});
