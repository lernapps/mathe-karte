/*
 * Bild zu „Reste“: die Rest-Uhr. Alle möglichen Reste (oder die Einerziffern einer Periode) stehen im Kreis; so sieht
 * man, dass es nur endlich viele Fälle gibt. Vor der Lösung ist nur der Start markiert, danach auch das Ergebnis.
 * Nur svgEl aus dem Kern, kein document: läuft beim Build (Mini-DOM) und im Browser.
 */
import { svgEl } from "../../../kern/js/svg.js";

const BREITE = 300;
const HOEHE = 300;
const MITTE = { x: 150, y: 140 };
const RADIUS = 100;
const START = "#ff8f00";
const ZIEL = "#1d4ed8";

export function zeichneRestuhr(svg, aufgabe, ergebnis) {
  const { titel, labels, start, ziel, startText, zielText } = aufgabe.uhr;
  const geloest = Boolean(ergebnis && ergebnis.korrekt);
  const beschreibung = geloest ? `${titel}. Start: ${startText} bei ${labels[start]}. Ergebnis: ${zielText} bei ${labels[ziel]}.` : `${titel}. Start: ${startText} bei ${labels[start]}.`;
  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${BREITE} ${HOEHE}`);
  svg.setAttribute("width", String(BREITE));
  svg.setAttribute("height", String(HOEHE));
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", beschreibung);
  svg.append(svgEl("title", {}, beschreibung));
  svg.append(svgEl("circle", { cx: MITTE.x, cy: MITTE.y, r: RADIUS, fill: "none", stroke: "#9ca3af", "stroke-width": 2 }));
  labels.forEach((text, i) => {
    const w = (2 * Math.PI * i) / labels.length - Math.PI / 2;
    const x = MITTE.x + RADIUS * Math.cos(w);
    const y = MITTE.y + RADIUS * Math.sin(w);
    const istZiel = geloest && i === ziel;
    const farbe = istZiel ? ZIEL : "#fff";
    svg.append(svgEl("circle", { cx: x, cy: y, r: 16, fill: farbe, stroke: i === start ? START : "#374151", "stroke-width": i === start ? 5 : 1.5 }));
    svg.append(svgEl("text", { x, y: y + 5, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: istZiel ? "#fff" : "#1a1a1a" }, text));
  });
  svg.append(svgEl("text", { x: MITTE.x, y: MITTE.y - 4, "text-anchor": "middle", "font-size": 14, fill: "#92400e", "font-weight": 700 }, `Start: ${startText}`));
  if (geloest) svg.append(svgEl("text", { x: MITTE.x, y: MITTE.y + 16, "text-anchor": "middle", "font-size": 14, fill: ZIEL, "font-weight": 700 }, `Ergebnis: ${zielText}`));
  svg.append(svgEl("text", { x: MITTE.x, y: HOEHE - 12, "text-anchor": "middle", "font-size": 14, fill: "#1a1a1a" }, titel));
  return svg;
}
