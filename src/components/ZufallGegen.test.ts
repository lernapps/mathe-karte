// Use Case: Wahrscheinlichkeit üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel zufall).
import { describe, expect, test } from "vite-plus/test";
import * as tabelle from "./ZufallGegen.ts";
import { check, describe as beschreibe, generate, grund, solution, tipp, wrong } from "./ZufallGegen.ts";
import { bruch, EINS, gleich, minus, plus, text } from "./ZufallBruch.ts";

describe("Gegenereignis", () => {
  test("Lösung ist 1 − P(E), in jeder Art", () => {
    const arten = new Set<string>();
    for (let seed = 1; seed <= 80; seed++) {
      const a = generate(seed);
      arten.add(a.art);
      expect(gleich(plus(a.p, a.loesung), EINS)).toBe(true);
      expect(check(a, solution(a))).toBe(true);
      expect(check(a, `1-${text(a.p)}`)).toBe(true);
      expect(check(a, wrong(a))).toBe(false);
      expect(a.loesung.z).toBeGreaterThan(0);
    }
    expect([...arten].sort()).toEqual(["direkt", "einfach", "mindestens"]);
  });
  test("mindestens einmal 6 bei drei Würfen: das Beispiel der Seite", () => {
    for (let seed = 1; seed <= 400; seed++) {
      const a = generate(seed);
      if (a.mind?.experiment !== "wuerfel" || a.mind.zuege !== 3 || a.mind.id !== "s") continue;
      expect(a.loesung).toEqual(bruch(91, 216));
      expect(a.mind.term).toBe("(5/6)³");
      expect(a.mind.gegenName).toBe("kein einziges Mal 6");
      expect(check(a, "1-(5/6)^3")).toBe(true);
      expect(check(a, "0,42")).toBe(true);
      expect(grund(a, "125/216")).toBe("Das ist P(kein Mal 6) – das Gegenereignis. Jetzt noch 1 − diesen Wert.");
      return;
    }
    throw new Error("keine Aufgabe „mindestens einmal 6, dreimal“ gefunden");
  });
  test("P(E) statt P(nicht E)", () => {
    for (let seed = 1; seed <= 80; seed++) {
      const a = generate(seed);
      if (a.art === "mindestens" || gleich(a.p, a.loesung)) continue;
      expect(grund(a, text(a.p))).toBe("Das ist P(E). Gefragt ist das Gegenereignis: 1 − P(E).");
      expect(grund(a, text(minus(a.loesung, bruch(1, 1000))))).toBe(tipp(a));
    }
  });
  test("Beschreibung mit Bild in Worten", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const d = beschreibe(generate(seed));
      expect(d.task).toMatch(/Das Bild zeigt/);
      expect(d.solution).toMatch(/1 − /);
    }
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
