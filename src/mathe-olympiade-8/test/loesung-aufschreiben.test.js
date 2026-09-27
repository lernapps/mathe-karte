// Use Case: Lösungen richtig aufschreiben – „Ermittle alle“ mit Vollständigkeit und Probe. Generator und Prüfer.
import { test } from "node:test";
import assert from "node:assert/strict";
import { erzeugeZufall } from "../../kern/js/zufall.js";
import { erzeugeAufgabe, pruefeAntwort, teilerAnzahl } from "../js/aufgaben/loesung-aufschreiben.js";

test("teilerAnzahl zählt alle Teiler, auch 1 und die Zahl selbst", () => {
  assert.equal(teilerAnzahl(1), 1);
  assert.equal(teilerAnzahl(12), 6);
  assert.equal(teilerAnzahl(36), 9);
  assert.equal(teilerAnzahl(97), 2);
});

test("erzeugeAufgabe: „Ermittle alle“, ein Zahlenfeld für die Anzahl, Rechenweg mit Probe und Antwortsatz", () => {
  const z = erzeugeZufall(4);
  const arten = new Set();
  for (let i = 0; i < 60; i++) {
    const a = erzeugeAufgabe(z);
    arten.add(a.art);
    assert.equal(a.thema, "loesung-aufschreiben");
    assert.match(a.text, /Ermittle alle/);
    assert.equal(a.felder.length, 1);
    assert.equal(a.felder[0].id, "antwort");
    assert.ok(Number.isInteger(a.loesung.antwort) && a.loesung.antwort >= 1);
    assert.ok(a.rechenweg.some((z) => /Probe/.test(z)));
    assert.ok(a.rechenweg.some((z) => /keine weiteren|Andere/.test(z)));
    assert.ok(a.rechenweg.at(-1).startsWith("Antwort"));
    assert.equal(pruefeAntwort(a, { antwort: String(a.loesung.antwort) }).korrekt, true);
  }
  assert.deepEqual([...arten].sort(), ["paare", "tiere"]);
});

test("Paare a · b = n: Anzahl ist die Teileranzahl; Reihenfolge vergessen und 1 vergessen werden erkannt", () => {
  const z = erzeugeZufall(1);
  let a;
  do a = erzeugeAufgabe(z); while (a.art !== "paare");
  const d = teilerAnzahl(a.n);
  assert.equal(a.loesung.antwort, d);
  assert.equal(pruefeAntwort(a, { antwort: String(Math.ceil(d / 2)) }).fehler, "reihenfolge-vergessen");
  assert.equal(pruefeAntwort(a, { antwort: String(d - 2) }).fehler, "eins-vergessen");
});

test("Hühner und Kaninchen: jede Art mindestens einmal; die Null mitzuzählen wird erkannt", () => {
  const z = erzeugeZufall(2);
  let a;
  do a = erzeugeAufgabe(z); while (a.art !== "tiere");
  assert.equal(a.loesung.antwort, Math.floor((a.beine - 2) / 4));
  assert.equal(pruefeAntwort(a, { antwort: String(a.loesung.antwort + 1) }).fehler, "null-mitgezaehlt");
  assert.equal(pruefeAntwort(a, { antwort: "" }).korrekt, false);
});
