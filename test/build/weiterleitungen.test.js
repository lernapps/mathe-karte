// Use Case: Tutor-Link aus einem alten Chat (R-036, ADR-033) – die alten Adressen /<app>/<id>.html und
// /<app>/test.html führen ohne JavaScript auf die neue Seite des explainers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { weiterleitungen, weiterleitungsSeite } from "../../lib/weiterleitungen.js";
import kapitel from "../../karte/daten/kapitel.js";

test("je Seite eine Weiterleitung von <kapitel>/<seite>.html nach <seite>/, je Kapitel test.html zum Kapitel", () => {
  const liste = weiterleitungen(kapitel);
  assert.deepEqual(liste.find((w) => w.datei === "prozent/grundwert.html"), { datei: "prozent/grundwert.html", ziel: "grundwert/" });
  assert.deepEqual(liste.find((w) => w.datei === "zufall/test.html"), { datei: "zufall/test.html", ziel: "./" });
  const seiten = kapitel.reduce((n, k) => n + Object.keys(k.seiten).length, 0);
  assert.equal(liste.length, seiten + kapitel.length);
});

test("die Seite leitet ohne JavaScript weiter, ist nicht indexiert und nennt den Link", () => {
  const html = weiterleitungsSeite("grundwert/", "https://lernapps.github.io/mathe-karte/prozent/grundwert/");
  assert.match(html, /<html lang="de">/);
  assert.match(html, /<meta http-equiv="refresh" content="0; url=grundwert\/">/);
  assert.match(html, /<meta name="robots" content="noindex">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/lernapps.github.io\/mathe-karte\/prozent\/grundwert\/">/);
  assert.match(html, /<a href="grundwert\/">/);
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.doesNotMatch(html, /<script/);
});
