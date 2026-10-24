import { describe, expect, test } from "vite-plus/test";
import { urnenBild } from "./ZufallUrnen.ts";
import { URNEN } from "./ZufallModell.ts";

describe("Urne vor und nach dem ersten Zug", () => {
  test("nachher fehlt genau eine Kugel", () => {
    const bild = urnenBild("3r2b1g", "r");
    expect(bild.vorher.anzahl).toBe(6);
    expect(bild.nachher.anzahl).toBe(5);
    expect(bild.nachher.kugeln.filter((k) => k.farbe === "#c62828")).toHaveLength(2);
    expect(bild.gezogen.farbe).toBe("#c62828");
  });
  test("passt bei allen Urnen auf ein Handy", () => {
    for (const spec of URNEN) expect(urnenBild(spec, spec.charAt(1)).breite).toBeLessThanOrEqual(320);
  });
});
