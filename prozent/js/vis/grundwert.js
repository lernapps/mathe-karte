/* Bild zum Grundwert: p Kästchen sind bekannt, das ganze Feld (100 %) ist gesucht. */
import { formatZahl } from "../../../kern/js/zahlen.js?v=6ec40465";
import { zeichneRaster } from "./diagramme.js?v=6ec40465";

export function zeichneGrundwert(svg, aufgabe, ergebnis) {
  const zeigen = Boolean(ergebnis && ergebnis.korrekt);
  zeichneRaster(svg, aufgabe.prozentsatz, {
    titel: `${formatZahl(aufgabe.prozentsatz)} % = ${formatZahl(aufgabe.prozentwert)} ${aufgabe.einheit}`.trim(),
    untertitel: zeigen ? `100 % = ${formatZahl(aufgabe.grundwert)} ${aufgabe.einheit}`.trim() : "100 % = ?",
  });
}
