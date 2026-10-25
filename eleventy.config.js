/*
 * Build der Mathe-Karte (karte/ → dist/karte/) mit Eleventy. Den Rest der Site baut der explainer (vite.config.ts);
 * dessen Plugin karte() startet Eleventy, nachdem der explainer seine Seiten geschrieben hat. Geprüft wird die ganze
 * Ausgabe von lernapps check (Regeln von lernapps.net).
 */
import fs from "node:fs";
import path from "node:path";
import { versionsHash, versioniere } from "./lib/versionierung.js";
import { richteKarteEin } from "./karte/lib/eleventy.js";
import site from "./karte/_data/site.js";

function alleDateien(ordner) {
  return fs.readdirSync(ordner, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile())
    .map((e) => path.join(e.parentPath, e.name));
}

/** ?v=<Hash über JS/CSS/JSON der Karte> an jede lokale Referenz in JS und HTML der Karte (JSON: data.json). */
function versioniereKarte(ausgabe) {
  const dateien = alleDateien(ausgabe);
  const v = versionsHash(dateien.filter((p) => /\.(js|css|json)$/.test(p)).map((p) => [path.relative(ausgabe, p), fs.readFileSync(p)]));
  for (const p of dateien) {
    const art = p.endsWith(".js") ? "js" : p.endsWith(".html") ? "html" : undefined;
    if (art) fs.writeFileSync(p, versioniere(fs.readFileSync(p, "utf8"), v, art));
  }
  return v;
}

export default async function (eleventyConfig) {
  richteKarteEin(eleventyConfig);
  eleventyConfig.on("eleventy.after", ({ dir }) => {
    console.log(`[mathe-karte] Karte gebaut, ?v=${versioniereKarte(dir.output)}`);
  });
  return {
    dir: { input: "karte", output: "dist/karte", includes: "_includes", data: "_data" },
    pathPrefix: `${site.pfadPraefix}karte/`,
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
