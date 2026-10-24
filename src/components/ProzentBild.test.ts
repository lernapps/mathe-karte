// Use Case: Prozentrechnung üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel prozent).
// Tests des Bilds zur Aufgabe (ProzentBild.vue zeichnet, was diese Funktionen berechnen): Hunderterfeld, Prozentbalken,
// Vergleichsbalken, ihr Name für Screenreader und das Umbrechen langer Beschriftungen.
import { expect, test } from "vite-plus/test";
import {
  type Bild,
  BREITE,
  balkenLage,
  bildText,
  prozentbalkenLage,
  rasterKaestchen,
  umbrechen,
} from "./ProzentAufgabe.ts";

test("Hunderterfeld: 100 Kästchen, bei 12,5 % zwölf volle und ein halbes", () => {
  const kaestchen = rasterKaestchen(12.5);
  expect(kaestchen).toHaveLength(100);
  expect(kaestchen.filter((k) => k.voll)).toHaveLength(12);
  expect(kaestchen[12]?.teil).toBe(0.5);
  expect(kaestchen[99]).toEqual({ x: 226, y: 226, voll: false, teil: 0 });
  const bild: Bild = {
    art: "raster",
    gefuellt: 12.5,
    titel: "12,5 % von 80 €",
    untertitel: "100 Kästchen = Grundwert",
  };
  expect(bildText(bild)).toBe(
    "Hunderterfeld: 12,5 von 100 Kästchen sind blau. 12,5 % von 80 €; 100 Kästchen = Grundwert.",
  );
});

test("Prozentbalken: Füllung bis p, Beschriftung bleibt im Bild", () => {
  expect(prozentbalkenLage(75, "18 Schüler = 75 %").breite).toBe(240);
  const amRand = prozentbalkenLage(100, "1690 mAh = 65 %");
  expect(amRand.mitteX).toBeLessThanOrEqual(330 - (15 * 15 * 0.6) / 2);
  expect(prozentbalkenLage(0, "9 Personen = ? %").breite).toBe(0);
});

test("Vergleichsbalken: der längste füllt die Breite, ein unbekannter bleibt leer", () => {
  const lage = balkenLage([
    { wert: 80, grau: true, text: "Alter Preis (100 %): 80 €" },
    { wert: null, grau: false, text: "Neuer Preis: ?" },
  ]);
  expect(lage.zeilen.map((z) => z.breite)).toEqual([BREITE, 0]);
  expect(lage.hoehe).toBeGreaterThan(lage.zeilen[1]?.oben ?? 0);
});

test("lange Beschriftungen brechen um, kurze nicht", () => {
  expect(umbrechen("kurz", 320)).toEqual(["kurz"]);
  expect(umbrechen("Vergleichswert 405,90 € – ? % weniger als die Bezugsgröße", 320)).toEqual([
    "Vergleichswert 405,90 €",
    "– ? % weniger als die Bezugsgröße",
  ]);
});
