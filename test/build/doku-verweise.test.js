// Use Case: UC-7 (Tutor und Mensch finden die Architektur-Doku) – Übersicht und llms.txt verlinken /docs/.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// Unter der Adresse der Site, nicht relativ: lernapps.net liefert eine Kopie der Site unter einer anderen Adresse aus,
// gebaut mit npm run build; die Doku entsteht nur beim Deploy (pages.yml), ein Link docs/ liefe dort ins Leere.
test("Übersicht verlinkt die Architektur-Doku unter der Adresse der Site", () => {
  const start = fs.readFileSync("src/index.njk", "utf8");
  assert.match(start, /href="\{\{ site\.basis \}\}docs\/"/);
  assert.doesNotMatch(start, /href="docs\/"/);
});

test("llms.txt der Übersicht nennt die Architektur-Doku", () => {
  assert.match(fs.readFileSync("src/llms.njk", "utf8"), /\{\{ site\.basis \}\}docs\//);
});
