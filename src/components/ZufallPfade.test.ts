import { describe, expect, test } from "vite-plus/test";
import {
  auswahlFehler,
  check,
  describe as beschreibe,
  generate,
  grund,
  NUR_EIN_PFAD,
  solution,
  TIPP,
  wrong,
} from "./ZufallPfade.ts";
import { summe, text } from "./ZufallBruch.ts";

describe("2. Pfadregel", () => {
  test("die Lösung ist die Summe der passenden Pfade", () => {
    for (const art of ["pfadregel", "uebersetzen"] as const) {
      for (let seed = 1; seed <= 60; seed++) {
        const a = generate(seed, { art });
        expect(a.pfade.length).toBeGreaterThanOrEqual(1);
        expect(text(summe(a.werte))).toBe(text(a.loesung));
        expect(check(a, solution(a))).toBe(true);
        expect(check(a, { antwort: a.produkte.join("+").replaceAll(" · ", "*") })).toBe(true);
        expect(check(a, wrong(a))).toBe(false);
      }
    }
  });
  test("übersetzen: zwei Züge mit Zurücklegen, drei Arten von Ereignissen", () => {
    const namen = new Set<string>();
    for (let seed = 1; seed <= 60; seed++) {
      const a = generate(seed, { art: "uebersetzen" });
      expect(a.mit).toBe(true);
      expect(a.zuege).toBe(2);
      namen.add(a.name.split(" ")[0] ?? "");
    }
    expect([...namen].sort()).toEqual(["beide", "genau", "mindestens"]);
  });
  test("Diagnosen: Auswahl, nur ein Pfad, sonst der Tipp", () => {
    const a = generate(2);
    const erster = a.pfade[0] ?? "";
    const werte = a.werte[0];
    if (werte === undefined) throw new Error("kein Pfad");
    if (a.pfade.length > 1) {
      expect(auswahlFehler(a, [erster])).toMatch(/^Es fehl/);
      expect(grund(a, { antwort: text(werte) })).toBe(NUR_EIN_PFAD);
    }
    expect(auswahlFehler(a, a.pfade)).toBe("");
    expect(auswahlFehler(a, [])).toBe("");
    expect(grund(a, { antwort: "0,999", auswahl: a.pfade })).toBe(TIPP);
    expect(grund(a, solution(a))).toBe("");
  });
  test("Beschreibung", () => {
    const d = beschreibe(generate(1));
    expect(d.task).toContain("Ereignis E:");
    expect(d.solution).toContain("2. Pfadregel");
  });
});
