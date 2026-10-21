// Use Case: Kompetenz üben – breite Tabellen und Bilder in natürlicher Größe scrollen waagerecht und sind dann auch per
// Tastatur erreichbar (Regel accessible von lernapps.net, axe scrollable-region-focusable).
import { test } from "node:test";
import assert from "node:assert/strict";
import { aktualisiereScrollbereich } from "../../src/kern/js/scrollbereich.js";

// Ein Bereich, der nicht scrollt, bekommt keinen zusätzlichen Tabstopp.
function bereich(scrollWidth, clientWidth, attribute = {}) {
  const attr = new Map(Object.entries(attribute));
  return {
    scrollWidth, clientWidth,
    hasAttribute: (n) => attr.has(n), getAttribute: (n) => (attr.has(n) ? attr.get(n) : null),
    setAttribute: (n, v) => attr.set(n, String(v)), removeAttribute: (n) => attr.delete(n),
  };
}

test("ein scrollender Bereich wird fokussierbar", () => {
  const b = bereich(600, 320);
  aktualisiereScrollbereich(b);
  assert.equal(b.getAttribute("tabindex"), "0");
});

test("ein Bereich, der nicht mehr scrollt, verliert den Tabstopp wieder", () => {
  const b = bereich(320, 320, { tabindex: "0" });
  aktualisiereScrollbereich(b);
  assert.equal(b.getAttribute("tabindex"), null);
});

test("ohne Änderung schreibt es nichts: sonst meldet der MutationObserver sich selbst, ohne Ende", () => {
  const b = bereich(600, 320, { tabindex: "0" });
  let geschrieben = 0;
  const setze = b.setAttribute;
  b.setAttribute = (n, v) => { geschrieben++; setze(n, v); };
  aktualisiereScrollbereich(b);
  assert.equal(geschrieben, 0);
});

test("ein eigener tabindex bleibt", () => {
  const b = bereich(320, 320, { tabindex: "-1" });
  aktualisiereScrollbereich(b);
  assert.equal(b.getAttribute("tabindex"), "-1");
});
