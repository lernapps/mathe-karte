/*
 * Vite-Plugin der Mathe-Karte: Wenn der explainer seine Seiten nach dist/ geschrieben hat (closeBundle), baut Eleventy
 * die Karte nach dist/karte/ (eleventy.config.js) und prüft die ganze Ausgabe. Ein Fehler dort bricht den Build ab.
 * Vorher schreibt es die Weiterleitungen von den Adressen der alten Apps (lib/weiterleitungen.js), damit die
 * Prüfung sie mit erfasst. Nur im Build, nicht im Dev-Server (apply: "build"). Scheitert der explainer, läuft Eleventy nicht: sein Fehler
 * ist die Meldung, und dist/ hielte noch den alten Stand.
 */
import Eleventy from "@11ty/eleventy";
import { schreibeWeiterleitungen } from "../../lib/weiterleitungen.js";
import kapitel from "../daten/kapitel.js";
import site from "../_data/site.js";

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
      schreibeWeiterleitungen("dist", kapitel, site.basis);
      const eleventy = new Eleventy("karte", "dist/karte", { configPath: "eleventy.config.js", quietMode: true });
      await eleventy.write();
    },
  };
}
