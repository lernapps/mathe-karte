// Use Case: Kompetenzseite ohne JavaScript – das Beispielbild ist eine SVG-Datei, gezeichnet von derselben Komponente
// wie das Bild der Übung (scripts/bilder.mjs, ADR-033); eine veraltete Datei bricht den Test.
import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { main, svgsAus, eigenstaendig, themaFuerSvg, ohneKommentare } from "../../scripts/bilder.mjs";

test("svgsAus findet jedes <svg> ohne Scope-Attribute, mit dem Zwischentitel davor", () => {
  const html = '<div data-v-ab12><svg aria-label="A" data-v-ab12><g/></svg><p class="t" data-v-ab12>Ohne</p>'
    + '<div data-v-cd34><svg aria-label="B"><!--x--><g/></svg></div></div>';
  assert.deepEqual(svgsAus(html), [
    { titel: undefined, svg: '<svg aria-label="A"><g/></svg>' },
    { titel: "Ohne", svg: '<svg aria-label="B"><g/></svg>' },
  ]);
});

test("ohneKommentare entfernt auch zusammengesetzte Kommentare und lässt kein <!-- stehen", () => {
  assert.equal(ohneKommentare("a<!--[-->b<!--]-->c"), "abc");
  assert.equal(ohneKommentare("x<!<!---->--y-->z"), "xz");
  assert.equal(ohneKommentare("x<!--offen"), "xoffen");
});

test("eigenstaendig ergänzt Namensraum und Stil, themaFuerSvg übernimmt hell und dunkel", () => {
  const thema = themaFuerSvg(":root {\n  --page-text: #111;\n  color-scheme: light dark;\n}\n"
    + "@media (prefers-color-scheme: dark) {\n  :root {\n    --page-text: #eee;\n  }\n}\n");
  assert.match(thema, /svg \{ --page-text: #111; font-family/);
  assert.match(thema, /prefers-color-scheme: dark\) \{ svg \{ --page-text: #eee; \} \}/);
  assert.doesNotMatch(thema, /color-scheme: light/);
  const svg = eigenstaendig('<svg viewBox="0 0 1 1"><g/></svg>', ".a{}\n");
  assert.equal(svg, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><style>\n.a{}\n</style><g/></svg>\n');
});

test("jedes Bild in scripts/bilder.json entspricht seiner Komponente, und jede Seite zeigt es", async () => {
  assert.deepEqual(await main(["--pruefen"]), []);
  const seiten = fs.readdirSync("src", { recursive: true }).filter((d) => d.endsWith(".yaml")).map((d) => fs.readFileSync(`src/${d}`, "utf8")).join("\n");
  for (const { bild } of JSON.parse(fs.readFileSync("scripts/bilder.json", "utf8"))) {
    assert.match(seiten, new RegExp(`image: images/${bild}(-\\d+)?\\.svg`), bild);
  }
});
