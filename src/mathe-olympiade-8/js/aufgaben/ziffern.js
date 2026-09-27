/*
 * Kompetenz: Ziffern und Kryptogramme – Ziffern als Variablen, alle Lösungen systematisch finden.
 * Reine Funktionen, kein DOM, deterministisch über `zufall`. Kryptogramme löst ein kleiner Suchlauf über alle
 * Ziffernbelegungen; die Vorlagen sind eigene, keine aus Aufgaben der Olympiade.
 * URL-Parameter (öffentlicher Vertrag, in llms.txt dokumentiert): s (Quersumme 1–27, wählt die Art „Quersumme“), seed.
 */
import { ganzzahlFeld, pruefeGanzzahl } from "./mo.js";

export const THEMA = "ziffern";
export const URL_ZAHLEN = ["s"];
export const URL_TEXTE = [];

export const VORLAGEN = ["AB+BA=CDC", "AB+BA=CC", "AB+B=CA", "AB+A=BC", "AB+AB=BC", "AB+AB=CB", "AB+CA=BD", "AA+BB=CAC"];

/** Alle Lösungen als Rechnungen „27 + 72 = 99“. Standard: verschiedene Buchstaben, verschiedene Ziffern; keine führende 0. */
export function loeseKryptogramm(vorlage, { verschieden = true, fuehrendeNull = false } = {}) {
  const [links, rechts] = vorlage.split("=");
  const summanden = links.split("+");
  const buchstaben = [...new Set([...summanden, rechts].join(""))];
  const fuehrend = new Set([...summanden, rechts].map((w) => w[0]));
  const loesungen = [];
  const belegung = {};
  const wert = (w) => [...w].reduce((s, b) => s * 10 + belegung[b], 0);
  (function weiter(i, benutzt) {
    if (i === buchstaben.length) {
      if (summanden.reduce((s, w) => s + wert(w), 0) === wert(rechts)) {
        loesungen.push(`${summanden.map(wert).join(" + ")} = ${wert(rechts)}`);
      }
      return;
    }
    for (let z = 0; z <= 9; z++) {
      if ((verschieden && benutzt.includes(z)) || (z === 0 && !fuehrendeNull && fuehrend.has(buchstaben[i]))) continue;
      belegung[buchstaben[i]] = z;
      weiter(i + 1, [...benutzt, z]);
    }
  })(0, []);
  return loesungen;
}

const anzeige = (vorlage) => vorlage.replace("+", " + ").replace("=", " = ");

function kryptogramm(vorlage) {
  const loesungen = loeseKryptogramm(vorlage);
  const antwort = loesungen.length;
  const liste = antwort <= 10 ? loesungen.join("; ") : `${loesungen.slice(0, 4).join("; ")}; … (insgesamt ${antwort})`;
  return {
    art: "kryptogramm",
    vorlage,
    ohneVerschieden: loeseKryptogramm(vorlage, { verschieden: false }).length,
    mitNull: loeseKryptogramm(vorlage, { fuehrendeNull: true }).length,
    text: `Im Kryptogramm ${anzeige(vorlage)} stehen gleiche Buchstaben für gleiche Ziffern und verschiedene Buchstaben für verschiedene Ziffern. Keine Zahl beginnt mit 0. Ermittle alle Lösungen. Wie viele gibt es?`,
    loesung: { antwort },
    felder: [ganzzahlFeld("Anzahl der Lösungen", antwort)],
    tipp: "Schreib die Addition spaltenweise untereinander, von rechts nach links. Welcher Übertrag ist möglich? Unterscheide die Fälle „Übertrag 0“ und „Übertrag 1“.",
    rechenweg: [
      `Gleiche Buchstaben bedeuten gleiche Ziffern, verschiedene Buchstaben verschiedene Ziffern; die erste Ziffer jeder Zahl ist nicht 0.`,
      `Ich schreibe die Addition spaltenweise mit Übertrag auf und unterscheide die Fälle nach dem Übertrag. Jeder Fall liefert Gleichungen für die Ziffern.`,
      `Alle Lösungen, jede mit Probe: ${liste}.`,
      `Andere gibt es nicht, weil die Fälle alle möglichen Überträge abdecken (Vollständigkeit).`,
      `Antwort: Das Kryptogramm hat genau <strong>${antwort}</strong> ${antwort === 1 ? "Lösung" : "Lösungen"}.`,
    ],
  };
}

function quersumme(s) {
  let antwort = 0;
  let mitNull = 0;
  for (let x = 0; x <= 999; x++) {
    const q = Math.floor(x / 100) + Math.floor(x / 10) % 10 + x % 10;
    if (q !== s) continue;
    mitNull++;
    if (x >= 100) antwort++;
  }
  return {
    art: "quersumme",
    s,
    mitNull,
    text: `Wie viele dreistellige natürliche Zahlen haben die Quersumme ${s}?`,
    loesung: { antwort },
    felder: [ganzzahlFeld("Anzahl", antwort)],
    tipp: `Nenne die Ziffern a, b, c mit a ≥ 1. Geh die Fälle a = 1, a = 2, … durch: Wie viele Möglichkeiten gibt es jeweils für b + c?`,
    rechenweg: [
      `Es seien a, b, c die Ziffern, a von 1 bis 9, b und c von 0 bis 9. Gesucht: Anzahl der Lösungen von a + b + c = ${s}.`,
      `Fallunterscheidung nach a: Für jedes a zähle ich die Paare (b, c) mit b + c = ${s} − a, wobei b und c höchstens 9 sind.`,
      `Die Fälle a = 1 bis 9 decken alle dreistelligen Zahlen ab; zusammen sind es ${antwort}.`,
      `Antwort: Genau <strong>${antwort}</strong> dreistellige Zahlen haben die Quersumme ${s}.`,
    ],
  };
}

export function erzeugeAufgabe(zufall, vorgaben = {}) {
  const s = vorgaben.s;
  if (Number.isInteger(s) && s >= 1 && s <= 27) return { thema: THEMA, ...quersumme(s) };
  const teil = zufall.wahl(["quersumme", "kryptogramm"]) === "quersumme" ? quersumme(zufall.ganzzahl(3, 25)) : kryptogramm(zufall.wahl(VORLAGEN));
  return { thema: THEMA, ...teil };
}

const MELDUNGEN = {
  "fuehrende-null": "Eine dreistellige Zahl beginnt nicht mit 0. Welche deiner Zahlen sind in Wahrheit ein- oder zweistellig?",
  "gleiche-ziffern": "Verschiedene Buchstaben stehen für verschiedene Ziffern. Prüf jede deiner Lösungen darauf.",
  falsch: "Das stimmt noch nicht. Geh die Fälle systematisch durch und mach bei jeder Lösung die Probe.",
};

export function pruefeAntwort(aufgabe, antworten) {
  const r = aufgabe.loesung.antwort;
  const diagnosen = aufgabe.art === "quersumme"
    ? [["fuehrende-null", aufgabe.mitNull]]
    : [["gleiche-ziffern", aufgabe.ohneVerschieden], ["fuehrende-null", aufgabe.mitNull]];
  return pruefeGanzzahl(aufgabe, antworten, diagnosen, MELDUNGEN, `Es sind ${r}.`);
}
