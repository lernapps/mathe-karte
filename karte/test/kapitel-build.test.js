// Use Case: Mathe-Karte – die Kapitel des explainers stehen auf der Karte; eine fehlende Seite bricht den Build ab.
import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ladeKapitel, pruefeKapitel } from "../lib/kapitel.js";
import { leiteAdressenAb } from "../../lib/adressen.js";
import kapitel from "../daten/kapitel.js";

const adressen = leiteAdressenAb("https://lernapps.github.io/mathe-karte/");

test("jede Seite aus karte/daten/kapitel.js gibt es im explainer (src/<kapitel>/<seite>.yaml, in chapter.yaml)", () => {
  assert.deepEqual(pruefeKapitel(kapitel, "src"), []);
});

test("ladeKapitel liefert Einträge mit Kapitel-Adresse, Quellcode und Knoten je Seite", () => {
  const prozent = ladeKapitel({ kapitel, adressen }).find((a) => a.id === "prozent-trainer");
  assert.equal(prozent.basisUrl, "https://lernapps.github.io/mathe-karte/prozent/");
  assert.equal(prozent.quellcode, "https://github.com/lernapps/mathe-karte/tree/main/src/prozent");
  assert.deepEqual(prozent.kompetenzen.find((k) => k.id === "grundwert").kartenKnoten, ["prozent-grundwert"]);
});

function kapitelOrdner(pages, dateien) {
  const wurzel = fs.mkdtempSync(path.join(os.tmpdir(), "kapitel-"));
  fs.mkdirSync(path.join(wurzel, "k"));
  fs.writeFileSync(path.join(wurzel, "k", "chapter.yaml"), `title: K\nsummary: K\npages: [${pages.join(", ")}]\n`);
  for (const d of dateien) fs.writeFileSync(path.join(wurzel, "k", `${d}.yaml`), "title: x\n");
  return wurzel;
}

const eins = (seiten) => [{ id: "k-app", kapitel: "k", titel: "K", seiten }];

test("eine Seite ohne YAML-Datei oder ohne Eintrag in chapter.yaml ist ein Fehler", () => {
  const wurzel = kapitelOrdner(["a", "b"], ["a"]);
  assert.match(pruefeKapitel(eins({ a: ["x"], b: ["x"] }), wurzel).join(), /Seite "b"/);
  assert.match(pruefeKapitel(eins({ c: ["x"] }), wurzel).join(), /Seite "c"/);
  assert.deepEqual(pruefeKapitel(eins({ a: ["x"] }), wurzel), []);
  assert.throws(() => ladeKapitel({ kapitel: eins({ c: ["x"] }), quelle: wurzel, adressen }), /Seite "c"/);
});

test("ein Kapitel ohne chapter.yaml ist ein Fehler", () => {
  const wurzel = kapitelOrdner([], []);
  assert.match(pruefeKapitel([{ id: "y", kapitel: "fehlt", seiten: {} }], wurzel).join(), /Kapitel "fehlt"/);
});
