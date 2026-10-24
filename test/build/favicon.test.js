// Use Case: UC-7 (Tutor und Mensch finden die Architektur-Doku) – Doku und Übersicht tragen dasselbe "L"-Symbol.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const wurzelSvg = fs.readFileSync("public/favicon.svg", "utf8");

test("Doku-favicon.svg ist das lernapps-L, kein Vorlagen-Platzhalter", () => {
  const doku = fs.readFileSync("docs/site/assets/favicon.svg", "utf8");
  assert.doesNotMatch(doku, /TODO/);
  assert.equal(doku, wurzelSvg);
});

function icoGroessen(datei) {
  const b = fs.readFileSync(datei);
  assert.equal(b.readUInt16LE(2), 1, `${datei} ist keine ICO-Datei`);
  return Array.from({ length: b.readUInt16LE(4) }, (_, i) => b[6 + 16 * i] || 256);
}

test("favicon.ico der Wurzel enthält 16, 32 und 48 px", () => {
  assert.deepEqual(icoGroessen("public/favicon.ico"), [16, 32, 48]);
});

// Vite kopiert public/ unverändert in die Wurzel von dist/ (ADR-033); die Karte verlinkt ../favicon.svg.
test("favicon.ico und favicon.svg liegen in public/ und damit in der Wurzel der Ausgabe", () => {
  for (const name of ["favicon.ico", "favicon.svg"]) assert.ok(fs.existsSync(`public/${name}`), name);
  assert.match(fs.readFileSync("karte/_includes/karte.njk", "utf8"), /href="\.\.\/favicon\.svg"/);
});

test("Doku-favicon.ico ist dasselbe wie das der Wurzel", () => {
  assert.ok(fs.readFileSync("docs/site/assets/favicon.ico").equals(fs.readFileSync("public/favicon.ico")));
});
