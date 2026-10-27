/*
 * Die Kapitel des explainers (src/<kapitel>/) auf der Mathe-Karte: je Kapitel der Eintrag (Felder wie in data.json,
 * Skalen in karte/js/daten.js) und je Seite die Knoten der Karte, die sie übt. Die Seiten-ids sind die Dateinamen
 * src/<kapitel>/<seite>.yaml; karte/lib/kapitel.js prüft, dass es sie gibt und dass chapter.yaml sie listet.
 * Die ids der Einträge (prozent-trainer, …) sind öffentlicher Vertrag von data.json: nie ändern.
 */
const FELDER = {
  "aktiv-level": 2, // 1 Create, 2 Solve, 3 Collaborate, 4 Reflect, 5 Receive
  backend: "none", // none | optional | required
  "external-requests": "on-consent", // none | on-consent | always: Video-Blöcke laden YouTube erst nach dem Klick
  dsgvo: "amber", // green | amber | red | unknown – green vergibt erst eine Prüfung, nie die App selbst
  evidence: "anecdotal", // anecdotal | community-validated | research-backed
  lizenz: "",
  stand: "2026-10-27",
};

const BINOM = "klammern-binome";

export default [
  {
    id: "prozent-trainer",
    kapitel: "prozent",
    titel: "Prozentrechnung",
    klasse: 8,
    beschreibung: "Prozentrechnung, Klasse 7 und 8: Grundbegriffe, Prozentsatz, Prozentwert, Grundwert, Zunahme und Abnahme, Vergleiche und Sachaufgaben. Mit Erklärung, Bild und Übungsaufgaben.",
    kartenEintrag: { ...FELDER, jahrgaenge: [7, 8] },
    seiten: {
      grundbegriffe: ["prozent-grundbegriffe"],
      prozentsatz: ["prozent-prozentsatz"],
      prozentwert: ["prozent-prozentwert"],
      grundwert: ["prozent-grundwert"],
      veraenderung: ["prozent-veraenderung"],
      vergleich: ["prozent-vergleich"],
      sachaufgaben: ["prozent-sachaufgaben"],
    },
  },
  {
    id: "binom-trainer",
    kapitel: "binom",
    titel: "Binomische Formeln",
    klasse: 8,
    beschreibung: "Binomische Formeln, Klasse 8: Klammern multiplizieren, die drei Formeln, rückwärts faktorisieren und geschickt im Kopf rechnen. Mit Flächenbildern und Übungsaufgaben.",
    kartenEintrag: { ...FELDER, jahrgaenge: [8] },
    seiten: {
      "klammern-multiplizieren": [BINOM],
      "erste-binomische": [BINOM],
      "zweite-binomische": [BINOM],
      "dritte-binomische": [BINOM],
      "binome-rueckwaerts": [BINOM],
      "geschickt-rechnen": [BINOM],
    },
  },
  {
    id: "zufall-trainer",
    kapitel: "zufall",
    titel: "Wahrscheinlichkeit",
    klasse: 8,
    beschreibung: "Wahrscheinlichkeitsrechnung, Klasse 7 und 8: Laplace-Formel, Baumdiagramm, beide Pfadregeln, Gegenereignis und Ziehen ohne Zurücklegen. Mit Bildern und Übungsaufgaben.",
    kartenEintrag: { ...FELDER, jahrgaenge: [7, 8] },
    seiten: {
      laplace: ["zufall-laplace"],
      baumdiagramm: ["zufall-baumdiagramm"],
      "pfadregel-1": ["zufall-pfadregel-1"],
      gegenereignis: ["zufall-gegenereignis"],
      "ohne-zuruecklegen": ["zufall-ohne-zuruecklegen"],
      "pfadregel-2": ["zufall-pfadregel-2"],
      ergebnisformen: ["zufall-ergebnisform"],
      "pfade-uebersetzen": ["zufall-ereignis-uebersetzen"],
    },
  },
];
