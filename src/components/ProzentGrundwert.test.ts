// Use Case: Prozentrechnung üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel prozent).
// Tests der Übung „Grundwert berechnen“.
import { expect, test } from "vite-plus/test";
import { fuelle } from "./ProzentAufgabe.ts";
import {
  MELDUNGEN,
  about,
  check,
  describe,
  fassungen,
  generate,
  grund,
  mistakes,
  params,
  reason,
  show,
  solution,
  template,
  wrong,
} from "./ProzentGrundwert.ts";

test("Aufgabe 1: 17 Treffer sind 85 % der Würfe", () => {
  const a = generate(1);
  expect(a.text).toBe("Mia hat 17 Treffer erzielt. Das sind 85 % ihrer Würfe. Wie oft hat sie geworfen?");
  for (const richtig of ["20", "20 Würfe", "17*100/85"]) expect(check(a, { grundwert: richtig }), richtig).toBe(true);
  expect(grund(a, { grundwert: "14,45" })).toBe(MELDUNGEN.prozentwertStattGrundwert);
  expect(grund(a, { grundwert: "0,2" })).toBe(MELDUNGEN.nurEinProzent);
  expect(grund(a, { grundwert: "19" })).toBe(MELDUNGEN.falsch);
});

test("jede Aufgabe: Lösung richtig, typischer Fehler falsch, Grundwert größer als Prozentwert", () => {
  for (let seed = 1; seed <= 200; seed++) {
    const a = generate(seed);
    expect(check(a, solution(a))).toBe(true);
    expect(check(a, wrong(a))).toBe(false);
    // bei p = 10 ist 1 % des Grundwerts zugleich 10 % des Prozentwerts: dann gilt die erste Diagnose
    const erwartet = a.prozentsatz === 10 ? MELDUNGEN.prozentwertStattGrundwert : MELDUNGEN.nurEinProzent;
    expect(grund(a, wrong(a))).toBe(erwartet);
    expect(Number((solution(a)["grundwert"] ?? "").replace(",", "."))).toBeGreaterThan(a.prozentwert);
  }
  expect(describe(generate(1)).task).toContain("100 % = ?");
});

test("reason ist grund: die Meldung zur Antwort", () => {
  const a = generate(1);
  expect(reason(a, { grundwert: "14,45" }, undefined, "de")).toBe(MELDUNGEN.prozentwertStattGrundwert);
  expect(reason(a, { grundwert: "" }, undefined, "de")).toBe("Bitte gib eine Zahl ein, zum Beispiel 12,5.");
});

test("für den Tutor: der Text aus Fassung und Werten, typische Fehler, Antworten als Text", () => {
  const a = generate(1);
  expect(params(a)).toEqual({ Fassung: "sport", W: "17", p: "85" });
  expect(mistakes(a)).toEqual([{ grundwert: "14,45" }, { grundwert: "0,2" }]);
  expect(show(solution(a), a)).toBe("20 Würfe");
  expect(show({ grundwert: "20 Würfe" }, a)).toBe("20 Würfe");
  expect(template().replace(/\s/g, " ")).toContain("sport: „Mia hat {W} Treffer erzielt. Das sind {p} % ihrer Würfe.");
  for (let seed = 1; seed <= 67; seed++) {
    const aufgabe = generate(seed);
    const werte = params(aufgabe);
    expect(fuelle(fassungen()[werte["Fassung"] ?? ""] ?? "", werte)).toBe(aufgabe.text);
    const fehler = mistakes(aufgabe);
    expect(fehler).toHaveLength(about.mistakes.length);
    for (const antwort of fehler) if (antwort !== undefined) expect(check(aufgabe, antwort)).toBe(false);
  }
});
