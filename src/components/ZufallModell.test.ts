// Use Case: Wahrscheinlichkeit üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel zufall).
import { describe, expect, test } from "vite-plus/test";
import { bruch, gleich, summe, text } from "./ZufallBruch.ts";
import {
  baueBaum,
  blaetter,
  ereignisName,
  ereignisPfade,
  ereignisW,
  kugelListe,
  moeglicheEreignisse,
  nurErgebnisUndRest,
  pfadTerm,
  urne,
  waehleVersuch,
  wuerfelSechs,
  zufallAus,
} from "./ZufallModell.ts";

describe("Zufall", () => {
  test("derselbe Seed gibt dieselbe Folge", () => {
    const a = zufallAus(42);
    const b = zufallAus(42);
    expect([a.ganzzahl(1, 100), a.wahl([1, 2, 3]), a.mischen([1, 2, 3, 4])]).toEqual([
      b.ganzzahl(1, 100),
      b.wahl([1, 2, 3]),
      b.mischen([1, 2, 3, 4]),
    ]);
  });
});

describe("Urne und Texte", () => {
  test("Kugelliste", () => {
    expect(kugelListe(urne("3r2b1g").ergebnisse)).toBe("3 rote, 2 blaue und 1 gelbe Kugel");
    expect(kugelListe(urne("4r1b").ergebnisse)).toBe("4 rote Kugeln und 1 blaue Kugel");
    expect(kugelListe(urne("2r3b").ergebnisse)).toBe("2 rote und 3 blaue Kugeln");
  });
});

describe("Baum", () => {
  test("ohne Zurücklegen: das Beispiel der Seite Baumdiagramm", () => {
    const b = baueBaum(urne("3r2b"), 2, false);
    expect(blaetter(b).map((k) => text(k.pw))).toEqual(["3/10", "3/10", "3/10", "1/10"]);
    expect(pfadTerm(b, "rb")).toBe("3/5 · 2/4");
  });
  test("die Pfadwahrscheinlichkeiten ergeben zusammen 1", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const { versuch, zuege, mit } = waehleVersuch(zufallAus(seed));
      const b = baueBaum(versuch, zuege, mit);
      expect(gleich(summe(blaetter(b).map((k) => k.pw)), bruch(1))).toBe(true);
      expect(blaetter(b).length).toBeLessThanOrEqual(9);
    }
  });
  test("ohne Zurücklegen fehlt ein leerer Zweig", () => {
    const b = baueBaum(urne("1r2b"), 2, false);
    expect(blaetter(b).map((k) => k.id)).toEqual(["rb", "br", "bb"]);
  });
});

describe("Ereignisse", () => {
  const b = baueBaum(urne("3r2b1g"), 2, false);
  test("genau einmal rot: das Beispiel der Seite Pfadregel 2", () => {
    expect(ereignisPfade(b, "genau1r").map((k) => k.id)).toEqual(["rb", "rg", "br", "gr"]);
    expect(ereignisW(b, "genau1r")).toEqual(bruch(3, 5));
  });
  test("Namen ohne doppelte Verneinung", () => {
    expect(ereignisName(wuerfelSechs(), 3, "keink")).toBe("jedes Mal eine 6");
    expect(ereignisName(wuerfelSechs(), 3, "mind1s")).toBe("mindestens einmal 6");
    expect(ereignisName(urne("3r2b"), 2, "rb")).toBe("erst rot, dann blau");
    expect(ereignisName(urne("3r2b"), 2, "genau3r")).toBeUndefined();
  });
  test("mindestens einmal über das Gegenereignis", () => {
    const w = baueBaum(wuerfelSechs(), 3, true);
    expect(ereignisW(w, "mind1s")).toEqual(bruch(91, 216));
    const g = baueBaum(nurErgebnisUndRest(urne("3r2b1g"), "g"), 2, true);
    expect(g.versuch.ergebnisse.map((e) => e.name)).toEqual(["gelb", "nicht gelb"]);
  });
  test("mögliche Ereignisse sind alle benannt", () => {
    expect(moeglicheEreignisse(urne("3r2b"), 2).every((e) => e.name !== "")).toBe(true);
  });
});
