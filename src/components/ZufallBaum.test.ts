import { describe, expect, test } from "vite-plus/test";
import { baumBild, kuerzelVon, legendeVon, MAX_BREITE, schriftFarbe } from "./ZufallBaum.ts";
import { baueBaum, muenze, nurErgebnisUndRest, urne, URNEN, wuerfelSechs } from "./ZufallModell.ts";

describe("Lage des Baums", () => {
  test("passt bei allen Urnen der Aufgaben in die Breite", () => {
    for (const spec of URNEN) {
      for (const mit of [true, false]) {
        const bild = baumBild(baueBaum(urne(spec), 2, mit), { zeigePfad: true });
        expect(bild.breite).toBeLessThanOrEqual(MAX_BREITE + 40);
      }
    }
    expect(baumBild(baueBaum(muenze(), 3, true), { zeigePfad: true }).breite).toBeLessThanOrEqual(MAX_BREITE);
  });
  test("fehlende Zweige heißen a, b … und zeigen ?", () => {
    const bild = baumBild(baueBaum(urne("3r2b"), 2, false), { versteckt: ["b", "rb"] });
    const fehlend = bild.zweige.filter((z) => z.buchstabe !== "");
    expect(fehlend.map((z) => [z.id, z.buchstabe, z.text])).toEqual([
      ["rb", "b", "?"],
      ["b", "a", "?"],
    ]);
    const geloest = baumBild(baueBaum(urne("3r2b"), 2, false), { versteckt: ["b"], geloest: true });
    expect(geloest.zweige.find((z) => z.id === "b")?.text).toBe("2/5");
  });
  test("ein Pfad färbt alle seine Zweige", () => {
    const bild = baumBild(baueBaum(urne("3r2b1g"), 2, true), { hervor: ["rb"] });
    expect(bild.zweige.filter((z) => z.betont).map((z) => z.id)).toEqual(["r", "rb"]);
  });
  test("Pfadwahrscheinlichkeiten unter den Blättern", () => {
    const bild = baumBild(baueBaum(wuerfelSechs(), 2, true), { zeigePfad: true });
    expect(bild.blaetter.map((b) => b.pfadText)).toEqual(["1/36", "5/36", "5/36", "25/36"]);
    expect(bild.blaetter[0]?.name).toBe("6-6");
  });
});

describe("Kürzel, Legende, Schrift", () => {
  test("Kürzel und Legende", () => {
    expect([...kuerzelVon(urne("3r2b1g").ergebnisse).values()]).toEqual(["R", "B", "G"]);
    expect(legendeVon(wuerfelSechs().ergebnisse)).toBe("K = keine 6");
    expect(legendeVon(nurErgebnisUndRest(urne("3r2b1g"), "g").ergebnisse)).toBe("G = gelb · N = nicht gelb");
  });
  test("lesbare Schrift auf jeder Farbe", () => {
    expect(schriftFarbe("#f9a825")).toBe("#1a1a1a");
    expect(schriftFarbe("#1565c0")).toBe("#ffffff");
  });
});
