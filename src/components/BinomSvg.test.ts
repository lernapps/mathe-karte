// BinomSvg.vue zeichnet eine Zeichnung aus BinomFlaeche.ts. Getestet wird, was es zeichnet: die Formen der Bilder,
// ihre Aufteilung nach den Längen, Farben, Beschriftungen und das Label für Screenreader.
import { expect, test } from "vite-plus/test";
import { produktBild, quadratMinus, raster, teile, umlegen } from "./BinomFlaeche.ts";
import { glied } from "./BinomTerm.ts";

test("teile: im Verhältnis der Längen, kleine Teile bleiben sichtbar", () => {
  expect(teile([1, 1], 200)).toEqual([100, 100]);
  expect(teile([8, 1], 100).map(Math.round)).toEqual([82, 18]);
  expect(teile([1, 3, 6], 100).map(Math.round)).toEqual([10, 30, 60]);
});

test("raster: ein Rechteck je Feld, Seiten außen, Titel und Label", () => {
  const z = raster(
    [
      { text: "x", laenge: 8 },
      { text: "3", laenge: 3 },
    ],
    [{ text: "x", laenge: 8 }],
    [
      [
        { flaeche: "a", text: "x²" },
        { flaeche: "ab", text: "3x" },
      ],
    ],
    "x(x + 3) = x² + 3x",
  );
  expect(z.label).toBe("x(x + 3) = x² + 3x.");
  expect([z.breite, z.hoehe]).toEqual([320, 290]);
  const rechtecke = z.formen.filter((f) => f.art === "rect");
  expect(rechtecke.map((f) => f.flaeche)).toEqual(["a", "ab"]);
  expect(rechtecke.reduce((s, f) => s + f.w, 0)).toBeCloseTo(220);
  const texte = z.formen.filter((f) => f.art === "text");
  expect(texte.find((f) => f.text === "3x")?.ton).toBe("innen");
  expect(texte.find((f) => f.text === "x(x + 3) = x² + 3x")?.fett).toBe(true);
});

test("produktBild: vor der Lösung Rechnungen, danach Werte, Minus-Felder rot", () => {
  const p = [glied(2, "x"), glied(-1)];
  const q = [glied(1, "x"), glied(4)];
  const offen = produktBild(p, q, false, "?", "");
  const fertig = produktBild(p, q, true, "!", "");
  const felder = (z: typeof offen) => z.formen.filter((f) => f.art === "text" && f.ton === "innen").map((f) => f.text);
  expect(felder(offen)).toEqual(["2x · x", "2x · 4", "−1 · x", "−1 · 4"]);
  expect(felder(fertig)).toEqual(["2x²", "8x", "−x", "−4"]);
  expect(fertig.formen.filter((f) => f.flaeche === "minus" && f.art === "rect")).toHaveLength(2);
});

test("quadratMinus und umlegen: Streifen, Ecke und Linie", () => {
  const a = { text: "x", laenge: 8 };
  const b = { text: "5", laenge: 5 };
  const q = quadratMinus(a, b, { rest: "(x − 5)²", restSeite: "x − 5", streifen: "5x", ecke: "25" }, "t", "u");
  expect(q.formen.filter((f) => f.art === "text").map((f) => f.text)).toEqual(
    expect.arrayContaining(["(x − 5)²", "− 5x", "+ 25", "x − 5"]),
  );
  expect(q.formen.some((f) => f.art === "line")).toBe(true);
  const u = umlegen(a, b, { oben: "o", unten: "u", rest: "x − 5", ecke: "− 25" }, "t", "u");
  expect(u.formen.filter((f) => f.art === "rect" && f.gestrichelt)).toHaveLength(1);
  expect(u.hoehe).toBeGreaterThan(290);
});
