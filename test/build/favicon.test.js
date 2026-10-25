// Use Case: Site ausliefern – das lernapps-„L“ als favicon in der Wurzel der Ausgabe, auch für die Karte.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function icoGroessen(datei) {
  const b = fs.readFileSync(datei);
  assert.equal(b.readUInt16LE(2), 1, `${datei} ist keine ICO-Datei`);
  return Array.from({ length: b.readUInt16LE(4) }, (_, i) => b[6 + 16 * i] || 256);
}

test("favicon.ico der Wurzel enthält 16, 32 und 48 px", () => {
  assert.deepEqual(icoGroessen("public/favicon.ico"), [16, 32, 48]);
});

// Vite kopiert public/ unverändert in die Wurzel von dist/ ; die Karte verlinkt ../favicon.svg.
test("favicon.ico und favicon.svg liegen in public/ und damit in der Wurzel der Ausgabe", () => {
  for (const name of ["favicon.ico", "favicon.svg"]) assert.ok(fs.existsSync(`public/${name}`), name);
  assert.match(fs.readFileSync("karte/_includes/karte.njk", "utf8"), /href="\.\.\/favicon\.svg"/);
});
