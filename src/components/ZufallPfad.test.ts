import { describe, expect, test } from "vite-plus/test";
import { ADDIERT, check, describe as beschreibe, generate, grund, solution, TIPP, wrong } from "./ZufallPfad.ts";
import { lies, mal, produkt, text } from "./ZufallBruch.ts";

describe("1. Pfadregel", () => {
  test("die Lösung ist das Produkt der Zweige", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const a = generate(seed);
      const faktoren = a.term.split(" · ").map((t) => lies(t)?.wert ?? { z: 0, n: 1 });
      expect(text(produkt(faktoren))).toBe(solution(a));
      expect(check(a, solution(a))).toBe(true);
      expect(check(a, a.term.replaceAll(" · ", "*"))).toBe(true);
      expect(check(a, wrong(a))).toBe(false);
    }
  });
  test("dieselbe Aufgabe für denselben Seed", () => {
    expect(generate(7)).toEqual(generate(7));
  });
  test("addiert statt multipliziert", () => {
    const a = generate(3);
    expect(grund(a, wrong(a))).toBe(ADDIERT);
    expect(grund(a, a.term.replaceAll(" · ", "+"))).toBe(ADDIERT);
    expect(grund(a, "0")).toBe(TIPP);
    expect(grund(a, "abc")).toMatch(/nicht lesen/);
    expect(grund(a, solution(a))).toBe("");
  });
  test("gerundete Dezimalzahl zählt", () => {
    const a = generate(5);
    const wert = lies(solution(a))?.wert ?? { z: 0, n: 1 };
    const prozent = mal(wert, { z: 100, n: 1 });
    expect(check(a, `${(Math.round((prozent.z / prozent.n) * 10) / 10).toString().replace(".", ",")} %`)).toBe(true);
  });
  test("die Beschreibung nennt Aufgabe und Lösung", () => {
    const d = beschreibe(generate(1));
    expect(d.task).toContain("Wie groß ist P(");
    expect(d.solution).toContain("1. Pfadregel");
  });
});
