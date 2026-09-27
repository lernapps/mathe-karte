/*
 * Gemeinsame Bausteine der Olympiade-Generatoren: ein Zahlenfeld für ganze Zahlen und eine Prüfung mit Diagnosen.
 * In der Mathematik-Olympiade zählt die Begründung auf dem Blatt; die App prüft nur die Zahl am Ende.
 */
import { zahlenfeld, pruefeZahlAntwort, passtZu } from "../../../kern/js/zahlantwort.js";
import { ergebnisFuer } from "../../../kern/js/pruefung.js";

export const BLATT_HINWEIS = "Nur die Zahl. Die Begründung schreibst du auf dein Blatt.";

/** Zahlenfeld „antwort“ für eine ganze Zahl; Rechenterme sind ein Hinweis, denn ausrechnen gehört dazu. */
export function ganzzahlFeld(label, wert) {
  return zahlenfeld({ id: "antwort", label, einheit: "", art: "zahl", stellen: 0, nurZahl: true, hinweis: BLATT_HINWEIS }, wert);
}

/**
 * Prüft das Feld „antwort“. diagnosen: [[fehlerId, falscherWert], …] in Reihenfolge; die erste passende gewinnt.
 * Ein Diagnosewert, der zufällig gleich der Lösung ist, wird übersprungen.
 */
export function pruefeGanzzahl(aufgabe, antworten, diagnosen, meldungen, richtigText) {
  const eingabe = antworten.antwort;
  const richtig = aufgabe.loesung.antwort;
  const ergebnis = pruefeZahlAntwort(eingabe, richtig, aufgabe.felder[0]);
  let fehler = ergebnis.fehler;
  if (fehler === "falsch") {
    const treffer = diagnosen.find(([, wert]) => wert !== richtig && wert >= 0 && passtZu(eingabe, wert));
    if (treffer) fehler = treffer[0];
  }
  const alle = { "keine-zahl": "Gib eine ganze Zahl ein, zum Beispiel 12.", ...meldungen };
  return ergebnisFuer("antwort", ergebnis, fehler, alle, richtigText);
}

/** Alle Teiler von n, aufsteigend. */
export function teilerVon(n) {
  const klein = [];
  const gross = [];
  for (let t = 1; t * t <= n; t++) {
    if (n % t !== 0) continue;
    klein.push(t);
    if (t * t !== n) gross.unshift(n / t);
  }
  return [...klein, ...gross];
}

/** Rest bei Division durch m, auch für negative Zahlen zwischen 0 und m − 1. */
export function rest(a, m) {
  return ((a % m) + m) % m;
}
