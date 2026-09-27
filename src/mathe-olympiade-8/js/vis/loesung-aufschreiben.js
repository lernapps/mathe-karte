/*
 * Bild zu „Lösungen richtig aufschreiben“: jeder Fall als Kästchen. Vor der Lösung stehen nur die Fälle da; danach
 * markiert ✓ die Lösungen und ✗ die ausgeschlossenen Randfälle. So sieht man Vollständigkeit: kein Fall fehlt.
 * Nur svgEl aus dem Kern, kein document: läuft beim Build (Mini-DOM) und im Browser.
 */
import { svgEl } from "../../../kern/js/svg.js";

const SPALTEN = 3;
const B = 104;
const H = 40;
const ABSTAND = 8;
const RAND = 12;

export function zeichneFaelle(svg, aufgabe, ergebnis) {
  const geloest = Boolean(ergebnis && ergebnis.korrekt);
  const { faelle } = aufgabe;
  const zeilen = Math.ceil(faelle.length / SPALTEN);
  const breite = 2 * RAND + SPALTEN * B + (SPALTEN - 1) * ABSTAND;
  const hoehe = 2 * RAND + zeilen * (H + ABSTAND) + 24;
  const titel = aufgabe.art === "tiere" ? "Fälle: k Kaninchen, h Hühner" : `Fälle: a · b = ${aufgabe.n}`;
  const gueltig = faelle.filter((f) => f.gueltig).length;
  const beschreibung = geloest ? `${titel}. ${gueltig} von ${faelle.length} Fällen sind Lösungen.` : `${titel}. ${faelle.length} Fälle.`;
  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${breite} ${hoehe}`);
  svg.setAttribute("width", String(breite));
  svg.setAttribute("height", String(hoehe));
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", beschreibung);
  svg.append(svgEl("title", {}, beschreibung));
  faelle.forEach((fall, i) => {
    const x = RAND + (i % SPALTEN) * (B + ABSTAND);
    const y = RAND + Math.floor(i / SPALTEN) * (H + ABSTAND);
    const ok = geloest && fall.gueltig;
    const raus = geloest && !fall.gueltig;
    svg.append(svgEl("rect", { x, y, width: B, height: H, rx: 6, fill: ok ? "#dbeafe" : raus ? "#f3f4f6" : "#fff", stroke: ok ? "#1d4ed8" : "#6b7280", "stroke-width": ok ? 2 : 1 }));
    const zeichen = ok ? " ✓" : raus ? " ✗" : "";
    svg.append(svgEl("text", { x: x + B / 2, y: y + H / 2 + 5, "text-anchor": "middle", "font-size": 12, fill: raus ? "#4b5563" : "#1a1a1a" }, `${fall.text}${zeichen}`));
  });
  svg.append(svgEl("text", { x: breite / 2, y: hoehe - 10, "text-anchor": "middle", "font-size": 14, fill: "#1a1a1a" }, geloest ? `${gueltig} Lösungen, kein Fall fehlt` : titel));
  return svg;
}
