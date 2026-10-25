// Use Case: Lehrkräfte und Eltern finden die Lehrplan-Karte – die Startseite verlinkt sie unter der Adresse der Site.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import site from "../../karte/_data/site.js";

test("die Startseite verlinkt die Lehrplan-Karte unter der Adresse der Site", () => {
  assert.ok(fs.readFileSync("src/app.yaml", "utf8").includes(`url: ${site.basis}karte/`));
});
