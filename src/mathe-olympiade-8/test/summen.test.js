// Use Case: Summen geschickt berechnen – Gaußsche Summenformel, Summen von Vielfachen und ungeraden Zahlen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { erzeugeZufall } from "../../kern/js/zufall.js";
import { erzeugeAufgabe, pruefeAntwort, URL_ZAHLEN } from "../js/aufgaben/summen.js";

const summe = (glieder) => glieder.reduce((s, x) => s + x, 0);
const bereich = (von, bis) => Array.from({ length: bis - von + 1 }, (_, i) => von + i);

test("erzeugeAufgabe: drei Arten, Lösung stimmt mit dem Aufaddieren überein", () => {
  const z = erzeugeZufall(11);
  const arten = new Set();
  for (let i = 0; i < 90; i++) {
    const a = erzeugeAufgabe(z);
    arten.add(a.art);
    assert.equal(a.thema, "summen");
    const glieder = a.art === "bis-n" ? bereich(1, a.n)
      : a.art === "vielfache" ? bereich(a.von, a.bis).filter((x) => x % a.k === 0)
        : bereich(1, a.unter - 1).filter((x) => x % 2 === 1);
    assert.equal(a.loesung.antwort, summe(glieder));
    assert.ok(a.rechenweg.at(-1).startsWith("Antwort"));
    assert.equal(pruefeAntwort(a, { antwort: String(summe(glieder)) }).korrekt, true);
  }
  assert.deepEqual([...arten].sort(), ["bis-n", "ungerade", "vielfache"]);
});

test("Parameter n: Summe 1 bis n; halbieren vergessen und Zaunpfahlfehler werden erkannt", () => {
  assert.deepEqual(URL_ZAHLEN, ["n"]);
  const a = erzeugeAufgabe(erzeugeZufall(1), { n: 100 });
  assert.equal(a.loesung.antwort, 5050);
  assert.equal(pruefeAntwort(a, { antwort: "10100" }).fehler, "halbieren-vergessen");
  const z = erzeugeZufall(5);
  let v;
  do v = erzeugeAufgabe(z); while (v.art !== "vielfache" || ((v.anzahl - 1) * (v.erstes + v.letztes)) % 2 !== 0);
  assert.equal(pruefeAntwort(v, { antwort: String(((v.anzahl - 1) * (v.erstes + v.letztes)) / 2) }).fehler, "anzahl-um-eins");
});
