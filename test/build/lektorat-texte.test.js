// Use Case: Kompetenzseite – die Texte sprechen wie eine Lehrkraft (Lektorat Runde 2). Muster, die nie wiederkommen
// sollen, werden in den Quellen aller Seiten des explainers gesucht (src/<kapitel>/*.yaml) und in den Texten der
// Übungskomponenten (src/components/*.ts, *.vue).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const seiten = [];
for (const ordner of await readdir("src", { withFileTypes: true })) {
  if (!ordner.isDirectory()) continue;
  for (const datei of await readdir(path.join("src", ordner.name))) {
    if (/\.(yaml|vue)$|(?<!\.test)\.ts$/.test(datei)) {
      seiten.push([`${ordner.name}/${datei}`, await readFile(path.join("src", ordner.name, datei), "utf8")]);
    }
  }
}

test("es gibt Seiten zum Prüfen", () => {
  assert.ok(seiten.filter(([name]) => name.endsWith(".yaml")).length >= 21, `${seiten.length} Dateien`);
});
const treffer = (muster) => seiten.flatMap(([name, text]) => (text.match(muster) || []).map((t) => `${name}: ${t}`));

test("L-035: keine Seite verweist mit einer Nummer auf eine Kompetenz – dafür gibt es Links mit Namen", () => {
  assert.deepEqual(treffer(/\(?(?:siehe )?Kompetenz \d+\)?/g), []);
});

test("L-042: keine Seite schreit ein „NICHT“ in Großbuchstaben", () => {
  assert.deepEqual(treffer(/\bNICHT\b/g), []);
});

test("L-048: Seiten sprechen wie eine Lehrkraft, nicht wie die App („der Trainer akzeptiert“)", () => {
  assert.deepEqual(treffer(/Trainer akzeptiert/gi), []);
});
