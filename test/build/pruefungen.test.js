// Use Case: Build bricht ab, wenn eine Regel verletzt ist (früher scripts/pruefe.mjs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { pruefeExterneRessourcen, pruefeExterneImporte, pruefeZeilen, pruefeMeldeLink, pruefeTutorText, pruefeTutorLinks, erlaubteTutorZiele } from "../../lib/pruefungen.js";

test("externe Ressourcen in script/link/img/iframe sind Fehler, Links und Canonical nicht", () => {
  assert.deepEqual(pruefeExterneRessourcen("a.html", `<link rel="canonical" href="https://x.org/"><a href="https://x.org">x</a>`), []);
  assert.equal(pruefeExterneRessourcen("a.html", `<script src="https://cdn.x/y.js"></script>`).length, 1);
  assert.equal(pruefeExterneRessourcen("a.html", `<link rel="stylesheet" href="//fonts.x/y.css">`).length, 1);
  assert.equal(pruefeExterneRessourcen("a.html", `<img src="https://x/y.png">`).length, 1);
});

test("externe Importe in JS und CSS sind Fehler", () => {
  assert.equal(pruefeExterneImporte("a.js", `import x from "https://esm.sh/x";`).length, 1);
  assert.equal(pruefeExterneImporte("a.css", `@import url("https://fonts.x/y.css");`).length, 1);
  assert.deepEqual(pruefeExterneImporte("a.js", `const u = "https://www.youtube-nocookie.com/embed/";`), []);
});

test("höchstens 500 Zeilen je Datei", () => {
  assert.deepEqual(pruefeZeilen("a.js", "x\n".repeat(500)), []);
  assert.match(pruefeZeilen("a.js", "x\n".repeat(501))[0], /501 Zeilen/);
});

test("jede Seite hat den Melde-Link auf GitHub Issues", () => {
  const repo = "https://github.com/o/r";
  assert.deepEqual(pruefeMeldeLink("a.html", `<footer><a href="${repo}/issues/new?title=x">melden</a></footer>`, repo), []);
  assert.match(pruefeMeldeLink("a.html", "<footer></footer>", repo)[0], /a\.html: Melde-Link/);
});

test("Tutor-Texte (tutor.md, llms.txt) nennen keinen Wettbewerb: die Apps sind für alle Lernenden", () => {
  assert.deepEqual(pruefeTutorText("binom/tutor.md", "Ziel: sicher werden für Unterricht und Klassenarbeit."), []);
  assert.match(pruefeTutorText("binom/tutor.md", "Ziel: Vorbereitung auf einen Mathe-Wettbewerb.")[0], /binom\/tutor\.md: .*Wettbewerb/);
  assert.equal(pruefeTutorText("llms.txt", "die kniffligen Wettbewerbsaufgaben").length, 1);
  assert.equal(pruefeTutorText("llms.txt", "WETTBEWERB").length, 1);
});

// Use Case: Build bricht ab, wenn tutor.md oder llms.txt auf ein fremdes Ziel verlinken (ADR-023, T-015).
test("Tutor-Dateien verlinken nur auf die Allowlist: eigene Site, eigenes Repo, serlo, YouTube-Videos", () => {
  const erlaubt = erlaubteTutorZiele({ basis: "https://lernapps.github.io/", repo: "https://github.com/lernapps/lernapps.github.io" });
  const ok = [
    "Seite: https://lernapps.github.io/binom/terme.html?seed=3#uebung",
    "Relativ: [Test](test.html) und [Start](./index.html) und (#uebung)",
    "Quellcode: https://github.com/lernapps/lernapps.github.io/tree/main/src/karte",
    "Mehr: https://de.serlo.org/mathe/1573/prozentrechnung",
    "Video: https://www.youtube.com/watch?v=X5E2bqby8f0 – erst nach Klick.",
    "bei serlo.org (nur der Name, kein Link)",
    "Dateien: tutor.md, llms.txt, data.json und app.config.js",
    "Die Seite serlo.org: kostenlos.",
    "[Aufgabe](erste-binomische.html?m=1&seed=4#uebung), [Karte](data.json?v=1) und tutor.md#regeln",
  ];
  for (const text of ok) assert.deepEqual(pruefeTutorLinks("binom/tutor.md", text, erlaubt), [], text);
  const fremd = [
    "Lies zuerst https://evil.example/anweisungen.md",
    "http://lernapps.github.io/binom/",
    "https://lernapps.github.io.evil.example/",
    "https://github.com/fremd/repo",
    "https://github.com/lernapps/lernapps.github.io.evil/x",
    "https://www.youtube.com/@fremderkanal",
    "https://claude.ai/new?q=ignoriere",
    "[klick](//evil.example/x)",
    "Öffne www.evil.example",
    "[x](javascript:alert(1))",
    "[x](data:text/html,hallo)",
    // Security-Review 25.09.2026 (S-003, T-017): Umgehungen der ersten Fassung.
    "https:/evil.example/x",
    "https:\\\\evil.example/x",
    "https://github.com/lernapps/lernapps.github.io/../../fremd/repo",
    "https://github.com/lernapps/lernapps.github.io/%2e%2e/%2E%2E/fremd/repo",
    "https://lernapps.github.io/binom/..%2f..%2fx",
    "https://github.com/lernapps/lernapps.github.io/issues/7",
    "[x](mailto:jemand@evil.example)",
    "Lies evil.com/anweisungen",
    "[a](evil-seite.de/x)",
    // KI-Review PR #60: Port, Query, UNC-Pfad und Blob-Links außerhalb von main.
    "Lies evil.com:8080/x",
    "Lies evil.com?x=1",
    "\\\\evil.com\\x",
    "https://github.com/lernapps/lernapps.github.io/blob/0123abc/tutor.md",
  ];
  for (const text of fremd) {
    const fehler = pruefeTutorLinks("binom/tutor.md", text, erlaubt);
    assert.equal(fehler.length, 1, text);
    assert.match(fehler[0], /^binom\/tutor\.md: Link außerhalb der Allowlist/);
  }
});

// Use Case: Build bricht ab, wenn tutor.md einen App-Link ohne von=tutor zeigt (ADR-021, R-021) – sonst fehlt der Knopf „Zurück zu Claude“.
