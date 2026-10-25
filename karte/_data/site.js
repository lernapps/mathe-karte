/*
 * Die EINZIGE Stelle mit der Adresse der Site. Alles andere – pathPrefix, Canonicals, App-Adressen, llms.txt,
 * tutor.md, claude.ai-Link, Quellcode-Links – leitet lib/adressen.js daraus ab. Zieht das Repo um, nur hier ändern.
 */
import fs from "node:fs";
import { leiteAdressenAb } from "../../lib/adressen.js";

// Nur ein default-Export: Mit zusätzlichen benannten Exporten liest Eleventy die Datendatei anders.
// GitHub Pages liefert die Site unter der Domain der Organisation aus; lernapps.github.io leitet dorthin um.
const BASIS_URL = "https://lernapps.net/mathe-karte/";
// Bei einer eigenen Domain lässt sich das Repository nicht aus der Adresse ableiten (lib/adressen.js).
const REPO = "https://github.com/lernapps/mathe-karte";

const paket = JSON.parse(fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

export default {
  ...leiteAdressenAb(BASIS_URL, REPO),
  titel: "Lern-Apps",
  version: paket.version,
  // Farbe der Übersicht (fachübergreifend); weiße Schrift erreicht WCAG AA.
  farbe: { primaer: "#374151", dunkel: "#1f2937" },
};
