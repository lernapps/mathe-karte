/*
 * Vite-Plugin der Mathe-Karte: Wenn der explainer seine Seiten nach dist/ geschrieben hat (closeBundle), baut Eleventy
 * die Karte nach dist/karte/ (eleventy.config.js) und prüft die ganze Ausgabe. Ein Fehler dort bricht den Build ab.
 * Nur im Build, nicht im Dev-Server (apply: "build").
 */
import fs from "node:fs";
import Eleventy from "@11ty/eleventy";

export function karte() {
  return {
    name: "mathe-karte",
    apply: "build",
    enforce: "post",
    async closeBundle() {
      // Ist der explainer gescheitert, gibt es nichts zu ergänzen: sein Fehler ist die Meldung.
      if (!fs.existsSync("dist/index.html")) return;
      const eleventy = new Eleventy("karte", "dist/karte", { configPath: "eleventy.config.js", quietMode: true });
      await eleventy.write();
    },
  };
}
