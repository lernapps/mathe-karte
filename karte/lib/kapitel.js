/*
 * Die Kapitel des explainers als Einträge der Karte (karte/daten/kapitel.js): liefert sie in der Form, die
 * karte/lib/eintraege.js liest (id, pfad, titel, basisUrl, quellcode, kartenEintrag, kompetenzen mit kartenKnoten).
 * Bricht ab, wenn eine Seite nicht als src/<kapitel>/<seite>.yaml existiert oder chapter.yaml sie nicht listet.
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

/** Fehler der Zuordnung: Seiten, die es im explainer nicht gibt. */
export function pruefeKapitel(kapitel, quelle) {
  const fehler = [];
  for (const k of kapitel) {
    const datei = path.join(quelle, k.kapitel, "chapter.yaml");
    if (!fs.existsSync(datei)) {
      fehler.push(`karte/daten/kapitel.js: Kapitel "${k.kapitel}" hat keine ${datei}`);
      continue;
    }
    const gelistet = new Set(parse(fs.readFileSync(datei, "utf8"))?.pages ?? []);
    for (const seite of Object.keys(k.seiten)) {
      if (!gelistet.has(seite) || !fs.existsSync(path.join(quelle, k.kapitel, `${seite}.yaml`))) {
        fehler.push(`karte/daten/kapitel.js: Seite "${seite}" fehlt in ${datei} oder als ${k.kapitel}/${seite}.yaml`);
      }
    }
  }
  return fehler;
}

/** Die Kapitel in der Form einer App für karte/lib/eintraege.js; adressen: aus karte/_data/site.js. */
export function ladeKapitel({ kapitel, quelle = "src", adressen }) {
  const fehler = pruefeKapitel(kapitel, quelle);
  if (fehler.length) throw new Error(`Mathe-Karte: ${fehler.join("\n- ")}`);
  return kapitel.map((k) => ({
    id: k.id,
    pfad: k.kapitel,
    titel: k.titel,
    klasse: k.klasse,
    beschreibung: k.beschreibung,
    basisUrl: adressen.appUrl(k.kapitel),
    quellcode: adressen.quellcode(k.kapitel),
    kartenEintrag: k.kartenEintrag,
    kompetenzen: Object.entries(k.seiten).map(([id, kartenKnoten]) => ({ id, kartenKnoten })),
  }));
}
