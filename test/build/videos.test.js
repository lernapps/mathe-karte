// Use Case: Kompetenzseite, Abschnitt „Video dazu“ – das Video ist ein Video-Block der Runtime (zwei Klicks,
// youtube-nocookie), kein Textlink zu YouTube; Kanal und Datenschutzhinweis zeigt der Block selbst.
import { test } from "vite-plus/test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

const seiten = [];
for (const ordner of await readdir("src", { withFileTypes: true })) {
  if (!ordner.isDirectory() || ordner.name === "components" || ordner.name === "images") continue;
  for (const datei of await readdir(path.join("src", ordner.name))) {
    if (!datei.endsWith(".yaml") || datei === "chapter.yaml") continue;
    seiten.push([`${ordner.name}/${datei}`, parse(await readFile(path.join("src", ordner.name, datei), "utf8"))]);
  }
}
const abschnittVideo = (seite) => (seite.blocks ?? []).find((b) => b.type === "section" && b.id === "video");

test("kein Text verlinkt ein YouTube-Video – dafür gibt es den Video-Block", () => {
  const links = seiten.flatMap(([name, seite]) =>
    JSON.stringify(seite).match(/youtube\.com\/watch|youtu\.be\//g) ? [name] : [],
  );
  assert.deepEqual(links, []);
});

test("jedes Video ist ein Video-Block mit id, Titel und dem Kanal Lehrerschmidt", () => {
  const videos = seiten.flatMap(([name, seite]) =>
    (abschnittVideo(seite)?.blocks ?? []).filter((b) => b.type === "video").map((v) => [name, v]),
  );
  assert.ok(videos.length >= 18, `${videos.length} Video-Blöcke`);
  const fehler = [];
  for (const [name, v] of videos) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(v.youtube) || !v.title?.trim() || v.channel !== "Lehrerschmidt") {
      fehler.push(`${name}: ${JSON.stringify(v)}`);
    }
  }
  assert.deepEqual(fehler, []);
});

test("kein Text wiederholt, was der Video-Block selbst sagt", () => {
  const saetze = seiten.flatMap(([name, seite]) =>
    (JSON.stringify(seite).match(/öffnen? YouTube|ein Video von Lehrerschmidt|vom Kanal Lehrerschmidt|von Lehrerschmidt \(YouTube\)/g) ?? [])
      .map((t) => `${name}: ${t}`),
  );
  assert.deepEqual(saetze, []);
});
