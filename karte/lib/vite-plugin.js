/*
 * Vite-Plugin der Mathe-Karte: Wenn der explainer seine Seiten nach dist/ geschrieben hat (closeBundle), baut Eleventy
 * die Karte nach dist/karte/ (eleventy.config.js) und prüft die ganze Ausgabe. Ein Fehler dort bricht den Build ab.
 * Nur im Build, nicht im Dev-Server (apply: "build"). Scheitert der explainer, läuft Eleventy nicht: sein Fehler
 * ist die Meldung, und dist/ hielte noch den alten Stand.
 */
import Eleventy from "@11ty/eleventy";

export function karte() {
  let gescheitert = false;
  return {
    name: "mathe-karte",
    apply: "build",
    enforce: "post",
    buildStart() {
      gescheitert = false;
    },
    buildEnd(fehler) {
      if (fehler) gescheitert = true;
    },
    renderError() {
      gescheitert = true;
    },
    async closeBundle() {
      if (gescheitert) return;
      const eleventy = new Eleventy("karte", "dist/karte", { configPath: "eleventy.config.js", quietMode: true });
      await eleventy.write();
    },
  };
}
