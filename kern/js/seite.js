/*
 * Seitenstart einer Kompetenzseite: Zwei-Klick-Videos vorbereiten, URL lesen, Trainer starten. Generisch.
 * Öffnet ein Deep Link eine bestimmte Aufgabe, klappt die Erklärung (<details id="erklaerung">) zu und holt die Übung
 * nach vorn; ohne JavaScript bleibt die Erklärung offen.
 * Die Seite übergibt App-Konfiguration, Generator und Bild (Dependency Inversion); die Version steht statisch im Footer.
 */
import { leseSeed } from "./zufall.js?v=6ec40465";
import { leseVorgaben, aufgabeImFokus } from "./aufgabenlink.js?v=6ec40465";
import { starteTrainer } from "./ui.js?v=6ec40465";
import { initVideos } from "./video.js?v=6ec40465";
import { initScrollbereiche } from "./scrollbereich.js?v=6ec40465";
import { vomTutor, zurueckKnopf, uebungsZeile } from "./zurueck.js?v=6ec40465";

/** App-Konfiguration (APP in js/app.config.js). @typedef {{ id: string, speicher: string, titel: string }} App */

/**
 * app: APP aus js/app.config.js (speicher = localStorage-Präfix). modul: der Generator (js/aufgaben/<id>.js); welche
 * URL-Parameter er annimmt, sagen seine Exporte URL_ZAHLEN und URL_TEXTE. zeichne(svg, aufgabe, ergebnis|undefined)
 * zeichnet das Bild zur Aufgabe in der Übung (optional), bildHinweis ergänzt dessen Beschriftung.
 * kompetenz: { nr, titel } für die Ergebniszeile von "Zurück zu Claude" (nur mit ?von=tutor, ADR-021).
 * @param {{ app: App, modul: import("./ui.js?v=6ec40465").Generator, zeichne?: import("./ui.js?v=6ec40465").Zeichner, bildHinweis?: string,
 *   kompetenz?: { nr: number, titel: string } }} seite
 */
export function starteSeite({ app, modul, zeichne, bildHinweis, kompetenz }) {
  initVideos(app.speicher);
  const wurzel = document.getElementById("trainer");
  if (!wurzel) {
    initScrollbereiche();
    return undefined;
  }
  const query = window.location.search;
  const zahlen = modul.URL_ZAHLEN || [];
  const texte = modul.URL_TEXTE || [];
  const trainer = starteTrainer({
    wurzel,
    modul,
    seed: leseSeed(query),
    vorgaben: leseVorgaben(query, zahlen, texte),
    zeichne,
    bildHinweis,
    seitenPfad: window.location.pathname.split("/").pop() || "",
  });
  initScrollbereiche();
  if (kompetenz && vomTutor(query)) {
    const zeile = () => uebungsZeile({ appTitel: app.titel, kompetenz, ...trainer.stand() });
    const absatz = document.createElement("p");
    absatz.className = "zurueck";
    absatz.append(...zurueckKnopf({ zeile }));
    wurzel.append(absatz);
  }
  if (aufgabeImFokus(query, window.location.hash, zahlen, texte)) holeUebungNachVorn();
  return trainer;
}

function holeUebungNachVorn() {
  const erklaerung = /** @type {HTMLDetailsElement | null} */ (document.getElementById("erklaerung"));
  if (erklaerung) erklaerung.open = false;
  // Die zugeklappte Zusammenfassung bleibt oben sichtbar, die Übung steht direkt darunter. Der Browser springt beim
  // Laden selbst noch zum Anker (#uebung) – deshalb nach "load" noch einmal.
  const hin = () => (erklaerung ?? document.getElementById("uebung"))?.scrollIntoView({ block: "start" });
  hin();
  if (document.readyState !== "complete") window.addEventListener("load", hin, { once: true });
}
