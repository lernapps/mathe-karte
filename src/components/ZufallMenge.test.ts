import { describe, expect, test } from "vite-plus/test";
import {
  frage,
  knopfName,
  mengeBild,
  mengeFarben,
  mengeKarten,
  mengeLose,
  mengeWuerfel,
  mengeZweiWuerfel,
  waehleMenge,
} from "./ZufallMenge.ts";
import { zufallAus } from "./ZufallModell.ts";

const guenstig = (m: { elemente: { guenstig: boolean }[] }) => m.elemente.filter((e) => e.guenstig).length;

describe("Ergebnismengen", () => {
  test("Würfel, Karten, zwei Würfel zählen richtig", () => {
    expect(guenstig(mengeWuerfel("prim"))).toBe(3);
    expect(guenstig(mengeKarten("bild"))).toBe(12);
    expect(guenstig(mengeKarten("rot"))).toBe(16);
    expect(guenstig(mengeZweiWuerfel("summe7"))).toBe(6);
    expect(guenstig(mengeZweiWuerfel("pasch"))).toBe(6);
    expect(mengeZweiWuerfel("pasch").elemente).toHaveLength(36);
  });
  test("Urne: jede Kugel ist ein Ergebnis", () => {
    const m = mengeFarben("urne", "3r2b1g", "b");
    expect(m.elemente).toHaveLength(6);
    expect(guenstig(m)).toBe(2);
    expect(m.farben).toBe(3);
    expect(m.kontext).toBe("In einer Urne liegen 3 rote, 2 blaue und 1 gelbe Kugel. Du ziehst blind eine Kugel.");
    expect(frage(m, m.ereignisName)).toBe("Wie groß ist die Wahrscheinlichkeit, dass du eine blaue Kugel ziehst?");
    expect(m.gegenFrage).toBe("keine blaue Kugel");
  });
  test("Gegenereignis ohne Verneinung, wo es geht", () => {
    expect(mengeWuerfel("mind5").gegenFrage).toBe("höchstens eine 4");
    expect(mengeLose(20, 3).gegenKurz).toBe("kein Gewinn");
  });
  test("jede Menge passt in die Breite eines Handys", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const bild = mengeBild(waehleMenge(zufallAus(seed)));
      expect(bild.breite).toBeLessThanOrEqual(320);
      expect(bild.elemente.length).toBeGreaterThan(0);
    }
  });
});

test("der Name eines wählbaren Felds beginnt mit seiner sichtbaren Beschriftung (axe label-content-name-mismatch)", () => {
  expect(knopfName({ form: "feld", label: "1|1", name: "rot 1, blau 1" })).toBe("1|1: rot 1, blau 1");
  expect(knopfName({ form: "feld", label: "rot", name: "rot" })).toBe("rot");
  expect(knopfName({ form: "kugel", label: "rot", name: "rote Kugel 1" })).toBe("rote Kugel 1");
});
