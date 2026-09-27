/*
 * Kompetenz: Lösungen richtig aufschreiben – „Ermittle alle …“ verlangt Vollständigkeit und Probe.
 * Reine Funktionen, kein DOM, deterministisch über `zufall`. Gefragt ist die Anzahl der Lösungen; die Lösungen selbst
 * und ihre Begründung stehen auf dem Blatt. Arten: geordnete Paare mit a · b = n, Hühner und Kaninchen mit Beinzahl.
 * URL-Parameter: keine außer seed/nr.
 */
import { ganzzahlFeld, pruefeGanzzahl, teilerVon } from "./mo.js";

export const THEMA = "loesung-aufschreiben";
export const URL_ZAHLEN = [];
export const URL_TEXTE = [];

const PRODUKTE = [12, 18, 20, 24, 28, 30, 32, 36, 40, 42, 44, 45, 48, 50, 52, 54, 56, 60, 63, 64, 72, 75, 80, 84, 90, 96, 100];

export function teilerAnzahl(n) {
  return teilerVon(n).length;
}

function paare(n) {
  const teiler = teilerVon(n);
  const d = teiler.length;
  return {
    art: "paare",
    n,
    text: `Ermittle alle geordneten Paare (a, b) natürlicher Zahlen größer als 0, für die a · b = ${n} gilt. Wie viele solche Paare gibt es?`,
    loesung: { antwort: d },
    felder: [ganzzahlFeld("Anzahl der Paare", d)],
    tipp: `Wenn a · b = ${n} ist, dann ist a ein Teiler von ${n}. Geh alle Teiler der Reihe nach durch. (1, ${n}) und (${n}, 1) sind verschiedene Paare.`,
    rechenweg: [
      `Gesucht sind alle Paare (a, b) mit a · b = ${n}, a und b größer als 0.`,
      `Weil a · b = ${n} ist, ist a ein Teiler von ${n}. Die Teiler sind ${teiler.join(", ")}.`,
      `Zu jedem Teiler a gibt es genau ein b, nämlich b = ${n} : a. Das ergibt ${d} Paare.`,
      `Andere Paare gibt es nicht, weil jedes a ein Teiler von ${n} sein muss (Vollständigkeit).`,
      `Probe: Für jedes Paar ist a · (${n} : a) = ${n}.`,
      `Antwort: Es gibt genau <strong>${d}</strong> solche Paare.`,
    ],
  };
}

function tiere(beine) {
  const max = Math.floor((beine - 2) / 4);
  const beispiel = `${max} Kaninchen und ${(beine - 4 * max) / 2} Hühner`;
  return {
    art: "tiere",
    beine,
    text: `Auf einem Hof leben Hühner und Kaninchen, von jeder Art mindestens ein Tier. Zusammen haben sie genau ${beine} Beine. Ermittle alle Möglichkeiten für die Anzahl der Hühner und der Kaninchen. Wie viele Möglichkeiten gibt es?`,
    loesung: { antwort: max },
    felder: [ganzzahlFeld("Anzahl der Möglichkeiten", max)],
    tipp: `Nenne die Anzahl der Kaninchen k und die der Hühner h. Dann ist 4k + 2h = ${beine}. Wie groß darf k höchstens werden, wenn h mindestens 1 ist?`,
    rechenweg: [
      `Es seien k die Anzahl der Kaninchen und h die der Hühner. Gegeben: 4k + 2h = ${beine}, k ≥ 1, h ≥ 1.`,
      `Weil h ≥ 1 ist, gilt 4k ≤ ${beine - 2}, also k ≤ ${max}.`,
      `Zu jedem k von 1 bis ${max} gibt es genau ein h = (${beine} − 4k) : 2. Es ist eine ganze Zahl, weil ${beine} gerade ist, und mindestens 1.`,
      `Andere Möglichkeiten gibt es nicht, weil k höchstens ${max} sein kann (Vollständigkeit).`,
      `Probe, zum Beispiel ${beispiel}: 4 · ${max} + 2 · ${(beine - 4 * max) / 2} = ${beine}.`,
      `Antwort: Es gibt genau <strong>${max}</strong> Möglichkeiten.`,
    ],
  };
}

export function erzeugeAufgabe(zufall) {
  const teil = zufall.wahl(["paare", "tiere"]) === "paare" ? paare(zufall.wahl(PRODUKTE)) : tiere(2 * zufall.ganzzahl(9, 31));
  return { thema: THEMA, ...teil };
}

const MELDUNGEN = {
  "reihenfolge-vergessen": "Achte auf „geordnet“: (2, 6) und (6, 2) sind zwei verschiedene Paare. Zähl beide.",
  "eins-vergessen": "Denk an die Randfälle: Auch 1 und die Zahl selbst sind Teiler. Welche Paare gehören dazu?",
  "null-mitgezaehlt": "Lies die Bedingung noch einmal: von jeder Art mindestens ein Tier. Welche deiner Möglichkeiten erfüllt das nicht?",
  falsch: "Das stimmt noch nicht. Geh systematisch vor: alle Fälle der Reihe nach, keinen auslassen, keinen doppelt.",
};

export function pruefeAntwort(aufgabe, antworten) {
  const r = aufgabe.loesung.antwort;
  const diagnosen = aufgabe.art === "paare"
    ? [["reihenfolge-vergessen", Math.ceil(r / 2)], ["eins-vergessen", r - 2]]
    : [["null-mitgezaehlt", r + 1]];
  return pruefeGanzzahl(aufgabe, antworten, diagnosen, MELDUNGEN, `Es gibt ${r}. Steht auf deinem Blatt auch, warum es keine weiteren gibt?`);
}
