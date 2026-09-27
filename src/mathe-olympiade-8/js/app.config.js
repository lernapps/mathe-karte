/*
 * Konfiguration der App "Mathematik-Olympiade Klasse 8". Reine Daten, kein DOM: der Build (lib/apps.js), die Seiten
 * und die Tests lesen diese Datei. Der Kern importiert sie NIE – die Seite übergibt APP und KOMPETENZEN.
 * Kein kartenEintrag: Die Mathe-Karte ordnet Lehrplan-Einheiten; die Olympiade folgt keinem Lehrplan.
 */

export const APP = {
  // localStorage-Präfix. Nie ändern, sonst ist die gespeicherte Selbsteinschätzung weg.
  id: "mathe-olympiade-8",
  pfad: "mathe-olympiade-8", // Ordner unter src/ und Pfad der App: <Basis-URL>mathe-olympiade-8/
  titel: "Mathematik-Olympiade Klasse 8",
  kurzname: "Olympiade 8", // Name unter dem App-Symbol (Manifest)
  fach: "mathe",
  klasse: 8,
  beschreibung: "Vorbereitung auf die Mathematik-Olympiade, Klasse 8: Lösungen begründet aufschreiben und Zahlentheorie (Teilbarkeit, Reste, Summen, Ziffern). Eigene Aufgaben mit Sofort-Feedback und Verweise auf offizielle Aufgaben. Ohne Server, ohne Tracking.",
  intro: "In der Mathematik-Olympiade zählt nicht nur die Zahl am Ende, sondern der ganze Weg dahin: jeder Schritt begründet, in ganzen Sätzen. Hier lernst du, wie man so eine Lösung aufschreibt, und übst die Zahlentheorie der Klasse 8. Jede Aufgabe löst du auf Papier; die App prüft die Zahl, dein Tutor die Begründung. Geometrie, Kombinatorik, Logik und Algebra folgen.",
};

/** Die Kompetenzen in Checklisten-Reihenfolge; die Nummer ergibt sich aus der Position. Muster: src/binom/js/app.config.js. */
export const KOMPETENZEN = [
  { id: "loesung-aufschreiben", titel: "Lösungen richtig aufschreiben", kurz: "Aufschreiben", seite: "loesung-aufschreiben.html", generator: "./aufgaben/loesung-aufschreiben.js" },
  { id: "teilbarkeit", titel: "Teilbarkeit und Teiler", kurz: "Teiler", seite: "teilbarkeit.html", generator: "./aufgaben/teilbarkeit.js" },
  { id: "reste", titel: "Reste und Fallunterscheidung", kurz: "Reste", seite: "reste.html", generator: "./aufgaben/reste.js" },
  { id: "summen", titel: "Summen geschickt berechnen", kurz: "Gauß", seite: "summen.html", generator: "./aufgaben/summen.js" },
  { id: "ziffern", titel: "Ziffern und Kryptogramme", kurz: "Ziffern", seite: "ziffern.html", generator: "./aufgaben/ziffern.js" },
];
