// Use Case: Wahrscheinlichkeit üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel zufall).
import { describe, expect, test } from "vite-plus/test";
import * as tabelle from "./ZufallTerm.ts";
import { check, describe as beschreibe, generate, grund, solution, TIPP, wrong } from "./ZufallTerm.ts";
import { lies, text } from "./ZufallBruch.ts";

describe("Term wählen", () => {
  test("genau ein richtiger Term, und er ergibt P(E)", () => {
    for (let seed = 1; seed <= 80; seed++) {
      const a = generate(seed);
      expect(a.optionen).toHaveLength(3);
      expect(a.optionen.filter((o) => o.richtig)).toHaveLength(1);
      expect(new Set(a.optionen.map((o) => o.text)).size).toBe(3);
      const richtig = a.optionen[solution(a)]?.text ?? "";
      expect(text(lies(richtig)?.wert ?? { z: -1, n: 1 })).toBe(text(a.loesung));
      expect(check(a, solution(a))).toBe(true);
      expect(check(a, wrong(a))).toBe(false);
    }
  });
  test("ein falscher Term sagt, welcher Fehler darin steckt", () => {
    const a = generate(3);
    const falsch = wrong(a);
    expect(grund(a, falsch)).toBe(`${a.optionen[falsch]?.fehler ?? ""} ${TIPP}`);
    expect(grund(a, solution(a))).toBe("");
    expect(grund(a, 7)).toBe("Wähl einen Term aus.");
  });
  test("Beschreibung listet A, B, C", () => {
    const d = beschreibe(generate(1));
    expect(d.task).toContain("- A) ");
    expect(d.solution).toMatch(/^Richtig ist [ABC]\)\./);
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
