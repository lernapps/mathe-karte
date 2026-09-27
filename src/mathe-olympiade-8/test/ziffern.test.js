// Use Case: Ziffern und Kryptogramme – Ziffern als Variablen, alle Lösungen eines Kryptogramms. Generator und Prüfer.
import { test } from "node:test";
import assert from "node:assert/strict";
import { erzeugeZufall } from "../../kern/js/zufall.js";
import { erzeugeAufgabe, pruefeAntwort, URL_ZAHLEN, loeseKryptogramm, VORLAGEN } from "../js/aufgaben/ziffern.js";

const quersumme = (x) => String(x).split("").reduce((s, z) => s + Number(z), 0);

test("loeseKryptogramm findet alle Lösungen: verschiedene Ziffern, keine führende Null", () => {
  assert.equal(loeseKryptogramm("AB+BA=CDC").length, 6);
  assert.deepEqual(loeseKryptogramm("AA+BB=CAC"), ["22 + 99 = 121"]);
  assert.equal(loeseKryptogramm("AB+B=CA", { verschieden: false }).length, 8);
  for (const v of VORLAGEN) assert.ok(loeseKryptogramm(v).length >= 1, v);
});

test("erzeugeAufgabe: beide Arten, Lösung stimmt mit Durchzählen überein", () => {
  const z = erzeugeZufall(12);
  const arten = new Set();
  for (let i = 0; i < 60; i++) {
    const a = erzeugeAufgabe(z);
    arten.add(a.art);
    assert.equal(a.thema, "ziffern");
    if (a.art === "quersumme") {
      const gezaehlt = Array.from({ length: 900 }, (_, k) => k + 100).filter((x) => quersumme(x) === a.s).length;
      assert.equal(a.loesung.antwort, gezaehlt);
    } else assert.equal(a.loesung.antwort, loeseKryptogramm(a.vorlage).length);
    assert.ok(a.rechenweg.at(-1).startsWith("Antwort"));
    assert.equal(pruefeAntwort(a, { antwort: String(a.loesung.antwort) }).korrekt, true);
  }
  assert.deepEqual([...arten].sort(), ["kryptogramm", "quersumme"]);
});

test("Parameter s: dreistellige Zahlen mit Quersumme s; führende Null und gleiche Ziffern werden erkannt", () => {
  assert.deepEqual(URL_ZAHLEN, ["s"]);
  const a = erzeugeAufgabe(erzeugeZufall(1), { s: 5 });
  assert.equal(a.loesung.antwort, 15);
  assert.equal(pruefeAntwort(a, { antwort: "21" }).fehler, "fuehrende-null");
  const z = erzeugeZufall(4);
  let k;
  do k = erzeugeAufgabe(z); while (k.art !== "kryptogramm" || k.ohneVerschieden === k.loesung.antwort);
  assert.equal(pruefeAntwort(k, { antwort: String(k.ohneVerschieden) }).fehler, "gleiche-ziffern");
});
