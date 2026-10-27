// Use Case: Wahrscheinlichkeit üben – Aufgabe, Bild, Prüfung und Rückmeldung (QZ-3, Kapitel zufall).
import { describe, expect, test } from "vite-plus/test";
import { leereWerte, vollstaendig } from "./ZufallAntwort.ts";

describe("Eingabe", () => {
  const felder = [
    { id: "mit", label: "mit Zurücklegen" },
    { id: "ohne", label: "ohne Zurücklegen" },
  ];
  test("beginnt leer", () => {
    expect(leereWerte(felder)).toEqual({ mit: "", ohne: "" });
  });
  test("ist vollständig, wenn jedes Feld etwas hat", () => {
    expect(vollstaendig({ mit: "1/6", ohne: " " }, felder)).toBe(false);
    expect(vollstaendig({ mit: "1/6", ohne: "1/5" }, felder)).toBe(true);
  });
});
