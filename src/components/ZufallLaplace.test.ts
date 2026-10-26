// Use Case: Wahrscheinlichkeit üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel zufall).
import { describe, expect, test } from "vite-plus/test";
import * as tabelle from "./ZufallLaplace.ts";
import { check, describe as beschreibe, generate, grund, solution, tipp, wrong } from "./ZufallLaplace.ts";
import { mengeFarben } from "./ZufallMenge.ts";
import { bruch } from "./ZufallBruch.ts";

describe("Laplace-Formel", () => {
  test("Lösung, andere Schreibweisen und Gegenbeispiel", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const a = generate(seed);
      expect(check(a, solution(a))).toBe(true);
      expect(check(a, `${a.guenstig}/${a.moeglich}`)).toBe(true);
      expect(check(a, wrong(a))).toBe(false);
      expect(a.guenstig).toBeGreaterThan(0);
      expect(a.guenstig).toBeLessThan(a.moeglich);
    }
  });
  test("Farben gezählt", () => {
    const menge = mengeFarben("urne", "3r2b1g", "b");
    const a = { menge, guenstig: 2, moeglich: 6, p: bruch(1, 3), text: "" };
    // 1/3 ist hier zufällig richtig – dann gibt es keinen Fehler
    expect(grund(a, "1/3")).toBe("");
    const rot = { ...a, menge: mengeFarben("urne", "3r2b1g", "r"), guenstig: 3, p: bruch(1, 2) };
    expect(grund(rot, "1/3")).toMatch(/Farben gezählt/);
    expect(grund(rot, "0,33")).toMatch(/Farben gezählt/);
    expect(grund(rot, "3/3")).toMatch(/übrigen/);
    expect(grund(rot, "0,9")).toBe(tipp(rot));
  });
  test("Beschreibung für Leser ohne JavaScript", () => {
    const d = beschreibe(generate(2));
    expect(d.task).toContain("Wie groß ist die Wahrscheinlichkeit");
    expect(d.solution).toContain("P(E) = günstig / möglich");
  });
});

test("für den Tutor: Vorlage und Werte geben den Text, typische Fehler sind falsch und haben eine Meldung", () => {
  const { about, check, generate, mistakes, params, reason, show, solution, template } = tabelle;
  const props = undefined;
  const fuelle = (text: string, werte: Record<string, string | number>) =>
    text.replace(/\{([^{}\s]+)\}/g, (platz, name: string) => String(werte[name] ?? platz));
  for (let seed = 1; seed <= 67; seed++) {
    const aufgabe = generate(seed, props);
    const werte = params(aufgabe, props, "de");
    for (const wert of Object.values(werte)) expect(String(wert).trim()).not.toBe("");
    expect(fuelle(template(props, "de"), werte).startsWith(aufgabe.text)).toBe(true);
    expect(show(solution(aufgabe) as never, aufgabe, props, "de").trim()).not.toBe("");
    const fehler = mistakes(aufgabe, props);
    expect(fehler).toHaveLength(about.mistakes.length);
    for (const antwort of fehler) {
      if (antwort === undefined) continue;
      expect(check(aufgabe, antwort as never)).toBe(false);
      expect(reason(aufgabe, antwort as never, props, "de")).not.toBe("");
    }
  }
});
