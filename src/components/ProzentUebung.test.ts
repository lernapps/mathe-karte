// Use Case: Prozentrechnung üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel prozent).
// Tests dessen, was die Übung (ProzentUebung.vue) prüft und zeigt: Prüfung aller Felder, der Grund einer falschen
// Antwort in seiner Reihenfolge (leer, fast richtig, Diagnose) und die Beschreibung für die Seite ohne JavaScript.
import { expect, test } from "vite-plus/test";
import {
  type Aufgabe,
  beschreibe,
  check,
  fuelle,
  grundFuer,
  hatEingabe,
  nurFalsche,
  platzhalter,
  solution,
  vorlage,
  zahlenfeld,
  zeige,
} from "./ProzentAufgabe.ts";
import { bruch } from "./ProzentKern.ts";

const aufgabe: Aufgabe = {
  text: "Berechne 12,5 % von 80 €.",
  felder: [
    {
      typ: "knoepfe",
      id: "gleichung",
      label: "Welche Gleichung passt?",
      optionen: [
        { wert: "a", text: "W = 80 · 12,5 / 100" },
        { wert: "b", text: "W = 80 · 100 / 12,5" },
      ],
      loesung: "a",
    },
    zahlenfeld("ergebnis", "Ergebnis (W)", "€", "geld", bruch(10)),
  ],
  bild: { art: "raster", gefuellt: 12.5, titel: "12,5 % von 80 €", untertitel: "100 % = 80 €" },
  bildGeloest: { art: "raster", gefuellt: 12.5, titel: "12,5 % von 80 €", untertitel: "= 10 €" },
  tipp: "Erst 1 %, dann mal 12,5.",
  rechenweg: ["W = 80 · 12,5 / 100 = 10 €"],
  richtig: "Ergebnis: 10 €.",
};
const diagnose = (antworten: Record<string, string>) => (antworten["ergebnis"] === "1000" ? "mal 100" : undefined);
const grund = (antwort: unknown) => grundFuer(aufgabe, antwort, diagnose, "falsch");

test("richtig nur, wenn jedes Feld stimmt", () => {
  expect(solution(aufgabe)).toEqual({ gleichung: "a", ergebnis: "10" });
  expect(check(aufgabe, { gleichung: "a", ergebnis: "10,00" })).toBe(true);
  expect(check(aufgabe, { gleichung: "b", ergebnis: "10" })).toBe(false);
  expect(check(aufgabe, "10")).toBe(false);
  expect(check(aufgabe, null)).toBe(false);
});

test("der Grund: erst ein leeres Feld, dann ein Hinweis, dann die Diagnose", () => {
  expect(grund({ gleichung: "", ergebnis: "10" })).toBe("Bitte wähle bei jedem Feld etwas aus.");
  expect(grund({ gleichung: "a", ergebnis: "" })).toBe("Bitte gib eine Zahl ein, zum Beispiel 12,5.");
  expect(grund({ gleichung: "a", ergebnis: "1000" })).toBe("mal 100");
  expect(grund({ gleichung: "b", ergebnis: "7" })).toBe("falsch");
});

test("Beschreibung: Aufgabe mit Bild und Feldern, Lösung mit Rechenweg", () => {
  const { task, solution: loesung } = beschreibe(aufgabe);
  expect(task).toContain("Bild zur Aufgabe: Hunderterfeld: 12,5 von 100 Kästchen sind blau.");
  expect(task).toContain("Zur Wahl: „W = 80 · 12,5 / 100“, „W = 80 · 100 / 12,5“");
  expect(loesung).toContain("- Welche Gleichung passt: W = 80 · 12,5 / 100");
  expect(loesung).toContain("- Ergebnis (W): 10 €");
  expect(loesung).toContain("Rechenweg:");
});

test("die Eingabe zählt erst, wenn ein Feld etwas hat", () => {
  expect(hatEingabe({ gleichung: "", ergebnis: " " })).toBe(false);
  expect(hatEingabe({ gleichung: "a", ergebnis: "" })).toBe(true);
});

test("eine Antwort als Text: jedes Feld mit Beschriftung, Zahl mit Einheit, Auswahl mit ihrem Text", () => {
  expect(zeige(aufgabe, { gleichung: "a", ergebnis: "10" })).toBe(
    "Welche Gleichung passt: W = 80 · 12,5 / 100; Ergebnis (W): 10 €",
  );
  expect(zeige(aufgabe, { gleichung: "", ergebnis: "10 €" })).toBe("Welche Gleichung passt: leer; Ergebnis (W): 10 €");
});

test("typische Fehler: eine Antwort, die zufällig richtig ist, zählt nicht", () => {
  expect(
    nurFalsche(aufgabe, [{ gleichung: "a", ergebnis: "10" }, { gleichung: "b", ergebnis: "10" }, undefined]),
  ).toEqual([undefined, { gleichung: "b", ergebnis: "10" }, undefined]);
});

test("die Vorlage für den Tutor: Platzhalter wie mitEinheit, jede Fassung, ausgefüllt der Text", () => {
  expect(platzhalter("G", "€").replace(/\s/g, " ")).toBe("{G} €");
  expect(platzhalter("p", "%").replace(/\s/g, " ")).toBe("{p} %");
  expect(platzhalter("n")).toBe("{n}");
  const text = vorlage({ preis: "Ein Rad kostet {G}." }, "Gesucht ist W.");
  expect(text).toBe(
    "Der Text der Aufgabe ist je nach {Fassung} einer von diesen: preis: „Ein Rad kostet {G}.“ Gesucht ist W.",
  );
  expect(fuelle("Ein Rad kostet {G} €, {x} bleibt.", { G: "250" })).toBe("Ein Rad kostet 250 €, {x} bleibt.");
});
