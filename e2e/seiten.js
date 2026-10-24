// Seitenliste der eigenen Browser-Tests (#26), aus der gebauten Ausgabe dist/: jede Seite des explainers und der
// Karte. Neue Kapitel und Seiten laufen so automatisch mit. Die Tests des explainers selbst stehen in explainer.e2e.ts.
import fs from "node:fs";
import path from "node:path";

const WURZEL = "dist";

function htmlSeiten(ordner) {
  return fs.readdirSync(path.join(WURZEL, ordner), { withFileTypes: true }).flatMap((e) => {
    const pfad = path.posix.join(ordner, e.name);
    if (e.isDirectory()) return e.name === "assets" ? [] : htmlSeiten(pfad);
    return e.name.endsWith(".html") && e.name !== "404.html" ? [pfad] : [];
  });
}

// Ordner-Adressen wie auf GitHub Pages: prozent/grundwert/ statt prozent/grundwert/index.html.
const adresse = (datei) => datei.replace(/(^|\/)index\.html$/, "$1");
const alle = htmlSeiten("").map(adresse).sort();

/** Seiten des explainers: Start, Kapitel, Inhaltsseiten, Glossar. */
export const explainerSeiten = alle.filter((p) => !p.startsWith("karte/"));
/** Inhaltsseiten des explainers (<kapitel>/<seite>/), auf ihnen stehen die Übungen. */
export const inhaltsSeiten = explainerSeiten.filter((p) => /^[^/]+\/[^/]+\/$/.test(p));
/** Seiten der Lehrplan-Karte (Eleventy). */
export const karteSeiten = alle.filter((p) => p.startsWith("karte/"));
export const alleSeiten = [...explainerSeiten, ...karteSeiten];

/** Sammelt Konsolenfehler und Skriptfehler einer Seite. */
export function sammleFehler(page) {
  const fehler = [];
  page.on("console", (m) => { if (m.type() === "error") fehler.push(`console: ${m.text()}`); });
  page.on("pageerror", (e) => fehler.push(`pageerror: ${e.message}`));
  return fehler;
}
