/*
 * Kompetenz: Summen geschickt berechnen – Gaußsche Summenformel, Summen gleichabständiger Zahlen (Vielfache, ungerade).
 * Reine Funktionen, kein DOM, deterministisch über `zufall`.
 * URL-Parameter (öffentlicher Vertrag, in llms.txt dokumentiert): n (2–10000, wählt „Summe 1 bis n“), seed.
 */
import { ganzzahlFeld, pruefeGanzzahl } from "./mo.js";

export const THEMA = "summen";
export const URL_ZAHLEN = ["n"];
export const URL_TEXTE = [];

const fmt = (x) => x.toLocaleString("de-DE");

function bisN(n) {
  const antwort = (n * (n + 1)) / 2;
  return {
    art: "bis-n",
    n,
    text: `Berechne die Summe 1 + 2 + 3 + … + ${n}.`,
    loesung: { antwort },
    felder: [ganzzahlFeld("Summe", antwort)],
    tipp: `Schreib die Summe zweimal untereinander, einmal vorwärts und einmal rückwärts. Was ergibt jede Spalte?`,
    rechenweg: [
      `Es sei S = 1 + 2 + … + ${n}. Rückwärts: S = ${n} + ${n - 1} + … + 1.`,
      `Addiere beide Zeilen spaltenweise: Jede der ${n} Spalten ergibt ${n + 1}, weil die obere Zahl um 1 wächst, wenn die untere um 1 fällt.`,
      `Also ist 2 · S = ${n} · ${n + 1} = ${fmt(n * (n + 1))} und S = ${fmt(antwort)}.`,
      `Antwort: Die Summe ist <strong>${fmt(antwort)}</strong>.`,
    ],
  };
}

function vielfache(zufall) {
  const k = zufall.ganzzahl(3, 9);
  const von = zufall.ganzzahl(10, 60);
  const bis = zufall.ganzzahl(150, 600);
  const erstes = Math.ceil(von / k) * k;
  const letztes = Math.floor(bis / k) * k;
  const anzahl = (letztes - erstes) / k + 1;
  const antwort = (anzahl * (erstes + letztes)) / 2;
  return {
    art: "vielfache",
    k, von, bis, erstes, letztes, anzahl,
    text: `Berechne die Summe aller durch ${k} teilbaren natürlichen Zahlen von ${von} bis ${bis}.`,
    loesung: { antwort },
    felder: [ganzzahlFeld("Summe", antwort)],
    tipp: `Welches ist die kleinste, welches die größte solche Zahl? Wie viele sind es genau? Vorsicht beim Zählen: Von 3 bis 12 in Dreierschritten sind es 4 Zahlen, nicht 3.`,
    rechenweg: [
      `Die kleinste durch ${k} teilbare Zahl ab ${von} ist ${erstes}, die größte bis ${bis} ist ${letztes}.`,
      `Anzahl: (${letztes} − ${erstes}) : ${k} + 1 = ${anzahl}. Das + 1 zählt die erste Zahl mit.`,
      `Wie bei Gauß: Schreib die Summe S vorwärts und rückwärts untereinander. Jede der ${anzahl} Spalten ergibt ${erstes} + ${letztes} = ${erstes + letztes}, weil oben um ${k} wächst, was unten um ${k} fällt.`,
      `Also ist 2 · S = ${anzahl} · ${erstes + letztes} und S = ${fmt(antwort)}.`,
      `Antwort: Die Summe ist <strong>${fmt(antwort)}</strong>.`,
    ],
  };
}

function ungerade(zufall) {
  const n = zufall.ganzzahl(15, 150);
  const unter = 2 * n;
  const antwort = n * n;
  return {
    art: "ungerade",
    unter,
    text: `Berechne die Summe aller ungeraden natürlichen Zahlen, die kleiner als ${unter} sind.`,
    loesung: { antwort },
    felder: [ganzzahlFeld("Summe", antwort)],
    tipp: `Wie viele ungerade Zahlen gibt es von 1 bis ${unter - 1}? Schreib die Summe vorwärts und rückwärts untereinander.`,
    rechenweg: [
      `Die Zahlen sind 1, 3, 5, …, ${unter - 1}. Es sind ${n}, weil unter je zwei aufeinanderfolgenden Zahlen von 1 bis ${unter} genau eine ungerade ist.`,
      `Vorwärts und rückwärts untereinander geschrieben ergibt jede der ${n} Spalten 1 + ${unter - 1} = ${unter}, weil oben um 2 wächst, was unten um 2 fällt.`,
      `Also ist 2 · S = ${n} · ${unter} und S = ${fmt(antwort)}.`,
      `Antwort: Die Summe ist <strong>${fmt(antwort)}</strong>.`,
    ],
  };
}

export function erzeugeAufgabe(zufall, vorgaben = {}) {
  const n = vorgaben.n;
  if (Number.isInteger(n) && n >= 2 && n <= 10000) return { thema: THEMA, ...bisN(n) };
  const art = zufall.wahl(["bis-n", "vielfache", "ungerade"]);
  const teil = art === "bis-n" ? bisN(zufall.ganzzahl(20, 300)) : art === "vielfache" ? vielfache(zufall) : ungerade(zufall);
  return { thema: THEMA, ...teil };
}

const MELDUNGEN = {
  "halbieren-vergessen": "Du hast die Summe doppelt: Vorwärts und rückwärts zusammen sind 2 · S. Was fehlt noch?",
  "anzahl-um-eins": "Zähl die Glieder noch einmal. Von der ersten bis zur letzten Zahl: Hast du die erste mitgezählt?",
  falsch: "Das stimmt noch nicht. Bestimme erstes Glied, letztes Glied und Anzahl, dann rechne wie Gauß.",
};

export function pruefeAntwort(aufgabe, antworten) {
  const r = aufgabe.loesung.antwort;
  const diagnosen = [];
  if (aufgabe.art === "bis-n") diagnosen.push(["halbieren-vergessen", 2 * r]);
  if (aufgabe.art === "vielfache") {
    const paar = aufgabe.erstes + aufgabe.letztes;
    diagnosen.push(["anzahl-um-eins", ((aufgabe.anzahl - 1) * paar) / 2], ["anzahl-um-eins", ((aufgabe.anzahl + 1) * paar) / 2]);
  }
  return pruefeGanzzahl(aufgabe, antworten, diagnosen, MELDUNGEN, `Die Summe ist ${fmt(r)}.`);
}
