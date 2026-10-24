/*
 * Verzeichnisdaten der Mathe-Karte (/karte/): Layout, Seitenadressen und die Karten-Daten aus karte/daten/ plus den
 * Einträgen der explainer-Kapitel (karte/daten/kapitel.js, karte/lib/kapitel.js). Ein unbekannter Knoten oder eine
 * fehlende Seite bricht den Build ab.
 */
import { ladeKapitel } from "./lib/kapitel.js";
import { ladeKarte } from "./lib/laden.js";
import { AKTIV_LEVEL, DSGVO, EXTERNE_ANFRAGEN } from "./js/daten.js";
import kapitel from "./daten/kapitel.js";
import externe from "./daten/externe-eintraege.js";
import site from "./_data/site.js";

export default async function () {
  const apps = ladeKapitel({ kapitel, quelle: "src", adressen: site });
  return {
    layout: "karte.njk",
    permalink: "{{ page.filePathStem }}.html",
    karte: await ladeKarte({ ordner: "karte/daten", apps, externe, version: site.version }),
    karteTexte: { aktivLevel: AKTIV_LEVEL, dsgvo: DSGVO, anfragen: EXTERNE_ANFRAGEN },
  };
}
