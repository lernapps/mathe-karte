// Use Case: UC-7 (Tutor und Mensch finden die Architektur-Doku) – Startseite und llms.txt verlinken /docs/.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import site from "../../karte/_data/site.js";

// Unter der Adresse der Site, nicht relativ: lernapps.net liefert eine Kopie der Site unter einer anderen Adresse aus,
// gebaut mit npm run build; die Doku entsteht nur beim Deploy (pages.yml), ein Link docs/ liefe dort ins Leere.
// Die Startseite baut der explainer aus src/app.yaml; die Links stehen unter sources, nicht im intro, weil das intro
// auch die Rolle im Tutor-Prompt beschreibt.
test("die Startseite verlinkt die Architektur-Doku unter der Adresse der Site", () => {
  const app = fs.readFileSync("src/app.yaml", "utf8");
  assert.ok(app.includes(`url: ${site.basis}docs/`), `src/app.yaml: sources ohne Link ${site.basis}docs/`);
  assert.doesNotMatch(app, /url: docs\//);
});

test("die Startseite verlinkt die Lehrplan-Karte unter der Adresse der Site", () => {
  assert.ok(fs.readFileSync("src/app.yaml", "utf8").includes(`url: ${site.basis}karte/`));
});
