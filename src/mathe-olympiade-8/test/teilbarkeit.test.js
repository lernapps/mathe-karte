// Use Case: Teilbarkeit und Teiler – Teileranzahl und „durch a oder durch b teilbar“. Generator und Prüfer.
import { test } from "node:test";
import assert from "node:assert/strict";
import { erzeugeZufall } from "../../kern/js/zufall.js";
import { erzeugeAufgabe, pruefeAntwort, URL_ZAHLEN, anzahlDurchAOderB } from "../js/aufgaben/teilbarkeit.js";

test("anzahlDurchAOderB zählt jede Zahl einmal, auch mit gemeinsamem Teiler (kgV)", () => {
  assert.equal(anzahlDurchAOderB(100, 2, 3), 67);
  assert.equal(anzahlDurchAOderB(60, 4, 6), 20);
});

test("erzeugeAufgabe: beide Arten, Lösung stimmt mit Durchzählen überein", () => {
  const z = erzeugeZufall(8);
  const arten = new Set();
  for (let i = 0; i < 60; i++) {
    const a = erzeugeAufgabe(z);
    arten.add(a.art);
    assert.equal(a.thema, "teilbarkeit");
    const gezaehlt = a.art === "teiler"
      ? Array.from({ length: a.n }, (_, k) => k + 1).filter((t) => a.n % t === 0).length
      : Array.from({ length: a.bis }, (_, k) => k + 1).filter((x) => x % a.a === 0 || x % a.b === 0).length;
    assert.equal(a.loesung.antwort, gezaehlt);
    assert.ok(a.rechenweg.at(-1).startsWith("Antwort"));
    assert.equal(pruefeAntwort(a, { antwort: String(gezaehlt) }).korrekt, true);
  }
  assert.deepEqual([...arten].sort(), ["oder", "teiler"]);
});

test("Parameter n wählt die Teileranzahl von n; typische Fehler werden erkannt", () => {
  assert.deepEqual(URL_ZAHLEN, ["n"]);
  const a = erzeugeAufgabe(erzeugeZufall(1), { n: 36 });
  assert.equal(a.art, "teiler");
  assert.equal(a.loesung.antwort, 9);
  assert.equal(pruefeAntwort(a, { antwort: "7" }).fehler, "eins-und-selbst-vergessen");
  assert.equal(pruefeAntwort(a, { antwort: "10" }).fehler, "quadrat-doppelt");
  assert.notEqual(erzeugeAufgabe(erzeugeZufall(1), { n: 1e6 }).n, 1e6);
});

test("„durch a oder b“: doppelt gezählt und Produkt statt kgV werden erkannt", () => {
  const z = erzeugeZufall(3);
  let a;
  do a = erzeugeAufgabe(z); while (a.art !== "oder" || a.kgv === a.a * a.b);
  const summe = Math.floor(a.bis / a.a) + Math.floor(a.bis / a.b);
  assert.equal(pruefeAntwort(a, { antwort: String(summe) }).fehler, "doppelt-gezaehlt");
  assert.equal(pruefeAntwort(a, { antwort: String(summe - Math.floor(a.bis / (a.a * a.b))) }).fehler, "produkt-statt-kgv");
});
