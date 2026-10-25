/* Bild zu Kompetenz 3: der Baum, der gefragte Pfad orange; nach der richtigen Antwort mit Pfadwahrscheinlichkeiten. */
import { gruppe, rahmen } from "./rahmen.js?v=6ec40465";
import { zeichneBaumIn } from "./baum.js?v=6ec40465";

export function zeichnePfadregel1(svg, aufgabe, ergebnis) {
  const blatt = aufgabe.zweige[aufgabe.zweige.length - 1];
  const g = gruppe();
  const { breite, hoehe } = zeichneBaumIn(g, aufgabe.baum, { hervorgehoben: new Set([blatt.id]), zeigePfad: Boolean(ergebnis && ergebnis.korrekt) });
  rahmen(svg, breite, hoehe, `Baumdiagramm, der Pfad ${aufgabe.zweige.map((z) => z.name).join("-")} ist markiert`, g);
}
