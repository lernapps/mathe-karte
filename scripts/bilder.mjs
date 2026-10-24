/*
 * Die Bilder im Abschnitt „Bild“ jeder Seite als statische SVG-Dateien (Projektregel „Text UND Bild ohne
 * JavaScript“, ADR-033): Eine Vue-Komponente des explainers zeigt ihr Bild erst, wenn das Skript der Seite läuft.
 * Darum rendert dieses Skript dieselbe Komponente mit denselben Props auf dem Server (Vue SSR über Vite) und schreibt
 * jedes ihrer <svg> nach src/images/; die Seite zeigt es als figure-Block. Eine Zeichenfunktion, zwei Wege: die Übung
 * zeichnet live, das Beispielbild kommt aus der Datei.
 *   node scripts/bilder.mjs               schreibt alle Bilder aus scripts/bilder.json neu
 *   node scripts/bilder.mjs --pruefen     bricht ab, wenn eine Datei nicht dem entspricht, was die Komponente zeichnet
 *   node scripts/bilder.mjs --uebernehmen ersetzt vue-component-Blöcke unter „Bild“ in src/<kapitel>/*.yaml durch
 *                                         figure-Blöcke und trägt sie in scripts/bilder.json ein (einmal je Seite)
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { parse as parseSfc } from "vue/compiler-sfc";
import { parseDocument } from "yaml";

const KONFIG = "scripts/bilder.json";
const THEMA = "node_modules/@lernapps/app-templates/runtime/shared/page.css";
const LIZENZ = "MIT";
const QUELLE = "Eigene Darstellung der Mathe-Karte";

/** Die Farbvariablen des explainers (hell und dunkel) aus seinem page.css, für das SVG statt :root. */
export function themaFuerSvg(css) {
  const hell = css.match(/:root\s*\{([^}]*)\}/)?.[1];
  const dunkel = css.match(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root\s*\{([^}]*)\}/)?.[1];
  if (!hell || !dunkel) throw new Error(`${THEMA}: Farbvariablen nicht gefunden`);
  const nurVariablen = (block) => block.split(";").map((z) => z.trim()).filter((z) => z.startsWith("--")).join("; ");
  return `svg { ${nurVariablen(hell)}; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }\n`
    + `@media (prefers-color-scheme: dark) { svg { ${nurVariablen(dunkel)}; } }\n`;
}

/** Die <svg>-Elemente einer gerenderten Komponente, je mit dem Text eines <p> direkt davor (Zwischentitel). */
export function svgsAus(html) {
  const ohneScope = html.replace(/ data-v-[0-9a-f]+(="")?/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const ergebnis = [];
  const muster = /(?:<p[^>]*>([^<]*)<\/p>\s*(?:<div[^>]*>\s*)?)?(<svg\b[\s\S]*?<\/svg>)/g;
  for (const [, titel, svg] of ohneScope.matchAll(muster)) ergebnis.push({ titel: titel?.trim() || undefined, svg });
  return ergebnis;
}

/** Ein eigenständiges SVG: Namensraum, Farbvariablen und die Stile der Komponenten im <style>. */
export function eigenstaendig(svg, stil) {
  const mitNs = svg.includes("xmlns=") ? svg : svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  return mitNs.replace(/^<svg\b[^>]*>/, (kopf) => `${kopf}<style>\n${stil}</style>`) + "\n";
}

const name = (svg) => svg.match(/aria-label="([^"]*)"/)?.[1];

function stileDer(praefix) {
  const ordner = "src/components";
  return fs.readdirSync(ordner).filter((d) => d.startsWith(praefix) && d.endsWith(".vue")).sort()
    .flatMap((d) => parseSfc(fs.readFileSync(path.join(ordner, d), "utf8")).descriptor.styles.map((s) => s.content.trim()))
    .join("\n") + "\n";
}

const praefixVon = (komponente) => komponente.match(/^[A-Z][a-z]+/)[0];

async function mitServer(tun) {
  const [{ createServer }, { default: vue }] = await Promise.all([import("vite-plus"), import("@vitejs/plugin-vue")]);
  const server = await createServer({
    root: process.cwd(), configFile: false, logLevel: "silent", plugins: [vue()], appType: "custom",
    server: { middlewareMode: true, hmr: false, ws: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    return await tun(async (komponente, props) => {
      const { default: k } = await server.ssrLoadModule(`/src/components/${komponente}.vue`);
      return renderToString(createSSRApp({ render: () => h(k, props) }));
    });
  } finally {
    await server.close();
  }
}

/** Die Dateien eines Eintrags { bild, komponente, props }: bild ist der Name ohne Endung, je <svg> eine Datei. */
async function dateienFuer(eintrag, rendere, thema) {
  const svgs = svgsAus(await rendere(eintrag.komponente, eintrag.props));
  if (!svgs.length) throw new Error(`${eintrag.komponente}: zeichnet kein <svg>`);
  const stil = thema + stileDer(praefixVon(eintrag.komponente));
  return svgs.map((s, i) => ({
    datei: `src/images/${eintrag.bild}${svgs.length > 1 ? `-${i + 1}` : ""}.svg`,
    inhalt: eigenstaendig(s.svg, stil),
    titel: s.titel,
    alt: name(s.svg),
  }));
}

/** Ersetzt im Abschnitt „bild“ einer Seite jeden vue-component-Block durch figure-Blöcke; liefert die neuen Einträge. */
async function uebernehme(datei, rendere, thema) {
  const doc = parseDocument(fs.readFileSync(datei, "utf8"));
  const [kapitel, seite] = datei.replace(/^src\//, "").replace(/\.yaml$/, "").split("/");
  const abschnitt = doc.get("blocks").items.find((b) => b.get("id") === "bild");
  if (!abschnitt) return [];
  const bloecke = abschnitt.get("blocks");
  const eintraege = [];
  for (let i = bloecke.items.length - 1; i >= 0; i--) {
    const block = bloecke.items[i].toJSON();
    if (block.type !== "vue-component") continue;
    const eintrag = { bild: `${kapitel}-${seite}${eintraege.length ? `-${eintraege.length + 1}` : ""}`, komponente: block.component, props: block.props ?? {} };
    const dateien = await dateienFuer(eintrag, rendere, thema);
    const figuren = dateien.map((d, n) => ({
      type: "figure",
      image: d.datei.replace(/^src\//, ""),
      alt: d.alt ?? block.props?.titel ?? "Bild zum Beispiel",
      caption: n === dateien.length - 1 && block.nojs ? block.nojs : (d.titel ?? d.alt),
      source: QUELLE,
      licence: LIZENZ,
    }));
    bloecke.items.splice(i, 1, ...figuren.map((f) => doc.createNode(f)));
    for (const d of dateien) fs.writeFileSync(d.datei, d.inhalt);
    eintraege.unshift(eintrag);
  }
  if (eintraege.length) fs.writeFileSync(datei, doc.toString({ lineWidth: 0 }));
  return eintraege;
}

export async function main(argumente) {
  const konfig = fs.existsSync(KONFIG) ? JSON.parse(fs.readFileSync(KONFIG, "utf8")) : [];
  const thema = themaFuerSvg(fs.readFileSync(THEMA, "utf8"));
  fs.mkdirSync("src/images", { recursive: true });
  return mitServer(async (rendere) => {
    if (argumente.includes("--uebernehmen")) {
      const kapitel = fs.readdirSync("src", { withFileTypes: true }).filter((e) => e.isDirectory() && fs.existsSync(`src/${e.name}/chapter.yaml`));
      for (const k of kapitel) {
        for (const d of fs.readdirSync(`src/${k.name}`).filter((d) => d.endsWith(".yaml") && d !== "chapter.yaml").sort()) {
          const neu = await uebernehme(`src/${k.name}/${d}`, rendere, thema);
          for (const e of neu) if (!konfig.some((x) => x.bild === e.bild)) konfig.push(e);
        }
      }
      konfig.sort((a, b) => a.bild.localeCompare(b.bild));
      fs.writeFileSync(KONFIG, JSON.stringify(konfig, null, 2) + "\n");
    }
    const fehler = [];
    for (const eintrag of konfig) {
      for (const d of await dateienFuer(eintrag, rendere, thema)) {
        if (!argumente.includes("--pruefen")) fs.writeFileSync(d.datei, d.inhalt);
        else if (!fs.existsSync(d.datei) || fs.readFileSync(d.datei, "utf8") !== d.inhalt) {
          fehler.push(`${d.datei} entspricht nicht ${eintrag.komponente}.vue: node scripts/bilder.mjs`);
        }
      }
    }
    return fehler;
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const fehler = await main(process.argv.slice(2));
  if (fehler.length) {
    console.error(`Bilder: ${fehler.length} Fehler\n  ✗ ${fehler.join("\n  ✗ ")}`);
    process.exit(1);
  }
  console.log("Bilder: alle statischen Bilder entsprechen ihren Komponenten (scripts/bilder.json)");
}
