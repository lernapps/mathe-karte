// Use Case: Reste und Fallunterscheidung – mit Resten rechnen, Endziffern von Potenzen. Generator, Prüfer, Bild.
import { test } from "node:test";
import assert from "node:assert/strict";
import { erzeugeZufall } from "../../kern/js/zufall.js";
import { leeresSvg, alsSvgText } from "../../kern/js/svg.js";
import { erzeugeAufgabe, pruefeAntwort, URL_ZAHLEN } from "../js/aufgaben/reste.js";
import { zeichneRestuhr } from "../js/vis/reste.js";

test("erzeugeAufgabe: beide Arten, Lösung stimmt mit direktem Rechnen überein", () => {
  const z = erzeugeZufall(6);
  const arten = new Set();
  for (let i = 0; i < 60; i++) {
    const a = erzeugeAufgabe(z);
    arten.add(a.art);
    assert.equal(a.thema, "reste");
    const x = a.art === "rest" ? a.m * 7 + a.r : 0;
    const erwartet = a.art === "rest" ? (a.c * x + a.d) % a.m : Number((BigInt(a.basis) ** BigInt(a.k)) % 10n);
    assert.equal(a.loesung.antwort, erwartet);
    assert.ok(a.rechenweg.at(-1).startsWith("Antwort"));
    assert.equal(pruefeAntwort(a, { antwort: String(erwartet) }).korrekt, true);
  }
  assert.deepEqual([...arten].sort(), ["endziffer", "rest"]);
});

test("Parameter m wählt die Art „Rest“ mit diesem Teiler; nicht reduziert und verschobene Periode werden erkannt", () => {
  assert.deepEqual(URL_ZAHLEN, ["m"]);
  const a = erzeugeAufgabe(erzeugeZufall(2), { m: 7 });
  assert.equal(a.art, "rest");
  assert.equal(a.m, 7);
  const roh = a.c * a.r + a.d;
  if (roh >= 7) assert.equal(pruefeAntwort(a, { antwort: String(roh) }).fehler, "nicht-reduziert");
  const z = erzeugeZufall(9);
  let e;
  do e = erzeugeAufgabe(z); while (e.art !== "endziffer" || e.zyklus[e.k % 4] === e.loesung.antwort);
  assert.equal(pruefeAntwort(e, { antwort: String(e.zyklus[e.k % 4]) }).fehler, "periode-verschoben");
});

test("Restuhr zeigt alle Reste als Zahlen, markiert das Ergebnis erst nach der Lösung", () => {
  const a = erzeugeAufgabe(erzeugeZufall(3), { m: 5 });
  const offen = alsSvgText(zeichneRestuhr(leeresSvg(), a, undefined) ?? leeresSvg());
  const svg = leeresSvg();
  zeichneRestuhr(svg, a, { korrekt: true });
  const text = alsSvgText(svg);
  for (let i = 0; i < 5; i++) assert.match(text, new RegExp(`>${i}<`));
  assert.match(text, /aria-label/);
  assert.doesNotMatch(offen, /Ergebnis/);
});
