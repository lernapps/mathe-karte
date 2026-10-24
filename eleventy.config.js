/*
 * Build der Mathe-Karte (karte/ → <Ausgabe>/karte/) mit Eleventy. Den Rest der Site baut der explainer (vite.config.ts);
 * dessen Plugin karte() startet Eleventy, nachdem der explainer seine Seiten geschrieben hat. Danach prüft dieser
 * Build die Regeln über die GANZE Ausgabe: Zeilengrenze der Quellen, keine fremden Ressourcen, keine toten internen
 * Links, Melde-Link der Karte, Tutor-Link-Allowlist (ADR-023) für jede llms.txt und tutor.md.
 */
import fs from "node:fs";
import path from "node:path";
import site from "./karte/_data/site.js";
import { versionsHash, versioniere } from "./lib/versionierung.js";
import { richteKarteEin } from "./karte/lib/eleventy.js";
import { pruefeZeilen, pruefeMeldeLink, pruefeTutorText, pruefeTutorLinks, erlaubteTutorZiele } from "./lib/pruefungen.js";
import { pruefeAusgabe } from "./lib/pruefe-ausgabe.js";
import { pruefeLinks } from "./lib/pruefe-links.js";

// Gepatchte Kopien des docToolchain-Themes (Architektur-Doku, TD-10): fremder Code, von der Zeilengrenze ausgenommen.
const THEME_KOPIEN = /^docs\/site\/assets\/css\/(asciidoctor|main\.min\.[0-9a-f]+)\.css$/;
const NICHT_QUELLEN = new Set(["node_modules", ".git", "worktrees", "dist", "_site", ".playwright-mcp", "package-lock.json", "build", ".gradle", "test-results", "playwright-report"]);

function alleDateien(ordner, ausnahmen = new Set()) {
  const liste = [];
  for (const e of fs.readdirSync(ordner, { withFileTypes: true })) {
    const p = path.join(ordner, e.name);
    if (ausnahmen.has(e.name)) continue;
    if (e.isDirectory()) liste.push(...alleDateien(p, ausnahmen));
    else liste.push(p);
  }
  return liste;
}

const lies = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");
const relativ = (wurzel, p) => path.relative(wurzel, p).split(path.sep).join("/");

/** Regeln über Quellen und die ganze Ausgabe (wurzel: dist/); liefert Fehlermeldungen. */
export function pruefe(wurzel) {
  const fehler = [];
  const quellen = alleDateien(".", NICHT_QUELLEN)
    .filter((p) => /\.(js|mjs|ts|vue|yaml|njk|md|css|txt|json|yml|svg)$/.test(p) && !THEME_KOPIEN.test(p));
  for (const p of quellen) fehler.push(...pruefeZeilen(p, fs.readFileSync(p, "utf8")));
  const dateien = alleDateien(wurzel);
  fehler.push(...pruefeAusgabe(dateien, (p) => fs.readFileSync(p, "utf8")));
  for (const p of dateien.filter((d) => d.endsWith(".html") && relativ(wurzel, d).startsWith("karte/"))) {
    fehler.push(...pruefeMeldeLink(p, fs.readFileSync(p, "utf8"), site.repo));
  }
  // Tote interne Links und Anker; die Doku unter docs/ baut docToolchain erst im Deploy dazu (pages.yml).
  const inhalte = Object.fromEntries(dateien.map((p) => [relativ(wurzel, p), p.endsWith(".html") ? fs.readFileSync(p, "utf8") : ""]));
  fehler.push(...pruefeLinks(inhalte, site.basis, { ausser: ["docs/"] }));
  for (const d of dateien.map((p) => relativ(wurzel, p)).filter((d) => /(^|\/)(llms\.txt|tutor\.md)$/.test(d))) {
    const text = lies(path.join(wurzel, d));
    fehler.push(...pruefeTutorText(d, text), ...pruefeTutorLinks(d, text, erlaubteTutorZiele(site)));
  }
  return fehler;
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
  eleventyConfig.on("eleventy.after", async ({ dir }) => {
    const wurzel = path.dirname(path.resolve(dir.output));
    const fehler = pruefe(wurzel);
    if (fehler.length) throw new Error(`Build-Prüfung: ${fehler.length} Fehler\n  ✗ ${fehler.join("\n  ✗ ")}`);
    console.log(`[mathe-karte] Karte gebaut und Site geprüft, ?v=${versioniereKarte(dir.output)}`);
  });
  return {
    dir: { input: "karte", output: "dist/karte", includes: "_includes", data: "_data" },
    pathPrefix: `${site.pfadPraefix}karte/`,
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
