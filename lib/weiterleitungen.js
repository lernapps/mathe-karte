/*
 * Weiterleitungen von den Adressen der alten Apps (R-036, ADR-033): Tutor-Links aus alten Chats zeigen auf
 * /<app>/<id>.html und /<app>/test.html. Die Kapitel des explainers heißen wie die alten Apps, die Seiten wie die
 * Kompetenzen; eine statische Seite je alter Adresse leitet ohne JavaScript weiter (meta refresh) und ist nicht
 * indexiert. Parameter wie seed und nr gehen verloren: die Aufgabennummern des explainers sind andere.
 */
import fs from "node:fs";
import path from "node:path";

/** Die Weiterleitungen { datei, ziel } relativ zur Wurzel der Ausgabe, aus karte/daten/kapitel.js. */
export function weiterleitungen(kapitel) {
  return kapitel.flatMap((k) => [
    ...Object.keys(k.seiten).map((seite) => ({ datei: `${k.kapitel}/${seite}.html`, ziel: `${seite}/` })),
    { datei: `${k.kapitel}/test.html`, ziel: "./" },
  ]);
}

/** Die Seite einer Weiterleitung: relatives Ziel für die Weiterleitung, absolute Adresse als canonical. */
export function weiterleitungsSeite(ziel, adresse) {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${ziel}">
<link rel="canonical" href="${adresse}">
<title>Die Seite ist umgezogen – Mathe-Karte</title>
</head>
<body>
<main>
<h1>Die Seite ist umgezogen</h1>
<p>Weiter zur neuen Seite: <a href="${ziel}">${adresse}</a></p>
</main>
</body>
</html>
`;
}

/** Schreibt alle Weiterleitungen nach `wurzel` (dist/); `basis` ist die Adresse der Site. */
export function schreibeWeiterleitungen(wurzel, kapitel, basis) {
  for (const { datei, ziel } of weiterleitungen(kapitel)) {
    const adresse = new URL(ziel, new URL(datei, basis)).href;
    fs.writeFileSync(path.join(wurzel, datei), weiterleitungsSeite(ziel, adresse));
  }
}
