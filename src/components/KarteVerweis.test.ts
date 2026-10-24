// Use Case: Mathe-Karte – jede Seite verlinkt ihren Knoten in der Lehrplan-Karte.
// Tests des Verweises auf die Lehrplan-Karte: relative Adresse mit dem Knoten, nur gültige Knoten-ids.
import { expect, test } from "vite-plus/test";
import { karteAdresse } from "./KarteVerweis.ts";

test("die Adresse führt von /<kapitel>/<seite>/ zur Karte mit dem Knoten", () => {
  expect(karteAdresse("prozent-grundwert")).toBe("../../karte/?knoten=prozent-grundwert");
});

test("ein Knoten ist eine id aus Kleinbuchstaben, Ziffern und Bindestrichen", () => {
  expect(() => karteAdresse("Prozent")).toThrow(/kein Knoten/);
  expect(() => karteAdresse("a&b=1")).toThrow(/kein Knoten/);
  expect(() => karteAdresse("")).toThrow(/kein Knoten/);
});
