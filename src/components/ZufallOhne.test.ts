// Use Case: Wahrscheinlichkeit üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel zufall).
import { describe, expect, test } from "vite-plus/test";
import * as tabelle from "./ZufallOhne.ts";
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
