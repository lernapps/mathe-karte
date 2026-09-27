/*
 * Kompetenz: Teilbarkeit und Teiler – Teiler systematisch in Paaren finden, Teileranzahl, „durch a oder durch b“.
 * Reine Funktionen, kein DOM, deterministisch über `zufall`.
 * URL-Parameter (öffentlicher Vertrag, in llms.txt dokumentiert): n (2–10000, wählt die Art „Teileranzahl von n“), seed.
 */
import { ganzzahlFeld, pruefeGanzzahl, teilerVon } from "./mo.js";

export const THEMA = "teilbarkeit";
export const URL_ZAHLEN = ["n"];
export const URL_TEXTE = [];

const ZAHLEN = [24, 30, 36, 40, 48, 54, 60, 64, 72, 80, 84, 90, 96, 100, 108, 120, 126, 144, 150, 180, 196, 200, 225];
// Paare (a, b) mit und ohne gemeinsamen Teiler; bei (4, 6) ist das kgV 12, nicht 24.
const PAARE = [[2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [2, 7], [3, 7], [4, 6], [6, 9], [6, 8], [4, 10]];
const BIS = [60, 100, 120, 150, 200, 240, 300];

const ggt = (x, y) => (y === 0 ? x : ggt(y, x % y));
const kgV = (x, y) => (x * y) / ggt(x, y);

export function anzahlDurchAOderB(bis, a, b) {
  return Math.floor(bis / a) + Math.floor(bis / b) - Math.floor(bis / kgV(a, b));
}

function teiler(n) {
  const alle = teilerVon(n);
  const d = alle.length;
  const paare = alle.filter((t) => t * t <= n).map((t) => (t * t === n ? `${t} · ${t}` : `${t} · ${n / t}`));
  return {
    art: "teiler",
    n,
    text: `Ermittle die Anzahl aller natürlichen Zahlen, die Teiler von ${n} sind.`,
    loesung: { antwort: d },
    felder: [ganzzahlFeld(`Anzahl der Teiler von ${n}`, d)],
    tipp: `Schreib ${n} als Produkt zweier Zahlen, beginnend mit 1 · ${n}, dann 2 · …, 3 · … Wann kannst du aufhören?`,
    rechenweg: [
      `Jeder Teiler t von ${n} gehört zu einem Paar t · (${n} : t). Ich gehe t = 1, 2, 3, … durch, bis t · t größer als ${n} ist:`,
      paare.join(", "),
      `Weiter muss ich nicht suchen, weil der kleinere Faktor eines Paares höchstens so groß ist wie der größere; alle Paare sind gefunden.`,
      `Die Teiler sind ${alle.join(", ")}.`,
      `Antwort: ${n} hat genau <strong>${d}</strong> Teiler.`,
    ],
  };
}

function oder(zufall) {
  const [a, b] = zufall.wahl(PAARE);
  const bis = zufall.wahl(BIS);
  const k = kgV(a, b);
  const antwort = anzahlDurchAOderB(bis, a, b);
  return {
    art: "oder",
    a,
    b,
    bis,
    kgv: k,
    text: `Wie viele der Zahlen 1, 2, 3, …, ${bis} sind durch ${a} oder durch ${b} teilbar (oder durch beide)? Begründe, dass du keine Zahl doppelt gezählt hast.`,
    loesung: { antwort },
    felder: [ganzzahlFeld("Anzahl", antwort)],
    tipp: `Zähl die Vielfachen von ${a} und die von ${b}. Welche Zahlen hast du dabei zweimal gezählt? Durch welche Zahl sind genau die teilbar?`,
    rechenweg: [
      `Durch ${a} teilbar: ${bis} : ${a} = ${Math.floor(bis / a)}${bis % a ? " Rest " + (bis % a) : ""}, also ${Math.floor(bis / a)} Zahlen.`,
      `Durch ${b} teilbar: ${Math.floor(bis / b)} Zahlen.`,
      `Doppelt gezählt sind die Zahlen, die durch ${a} und durch ${b} teilbar sind, also durch das kleinste gemeinsame Vielfache ${k}: ${Math.floor(bis / k)} Zahlen.`,
      `${Math.floor(bis / a)} + ${Math.floor(bis / b)} − ${Math.floor(bis / k)} = ${antwort}.`,
      `Antwort: Genau <strong>${antwort}</strong> der Zahlen sind durch ${a} oder durch ${b} teilbar.`,
    ],
  };
}

export function erzeugeAufgabe(zufall, vorgaben = {}) {
  const n = vorgaben.n;
  if (Number.isInteger(n) && n >= 2 && n <= 10000) return { thema: THEMA, ...teiler(n) };
  const teil = zufall.wahl(["teiler", "oder"]) === "teiler" ? teiler(zufall.wahl(ZAHLEN)) : oder(zufall);
  return { thema: THEMA, ...teil };
}

const MELDUNGEN = {
  "eins-und-selbst-vergessen": "Denk an die Randfälle: 1 und die Zahl selbst sind auch Teiler.",
  "quadrat-doppelt": "Schau dir das Paar mit zwei gleichen Faktoren an. Wie viele verschiedene Teiler stecken darin?",
  "doppelt-gezaehlt": "Manche Zahlen hast du zweimal gezählt. Welche sind durch beide Zahlen teilbar?",
  "produkt-statt-kgv": "Fast. Durch beide teilbar heißt: durch das kleinste gemeinsame Vielfache teilbar. Ist das hier wirklich das Produkt?",
  falsch: "Das stimmt noch nicht. Geh systematisch vor und schreib die Zwischenergebnisse auf.",
};

export function pruefeAntwort(aufgabe, antworten) {
  const r = aufgabe.loesung.antwort;
  const diagnosen = aufgabe.art === "teiler"
    ? [["eins-und-selbst-vergessen", r - 2], ["quadrat-doppelt", Number.isInteger(Math.sqrt(aufgabe.n)) ? r + 1 : -1]]
    : [["doppelt-gezaehlt", Math.floor(aufgabe.bis / aufgabe.a) + Math.floor(aufgabe.bis / aufgabe.b)],
      ["produkt-statt-kgv", aufgabe.kgv === aufgabe.a * aufgabe.b ? -1 : Math.floor(aufgabe.bis / aufgabe.a) + Math.floor(aufgabe.bis / aufgabe.b) - Math.floor(aufgabe.bis / (aufgabe.a * aufgabe.b))]];
  return pruefeGanzzahl(aufgabe, antworten, diagnosen, MELDUNGEN, `Es sind ${r}.`);
}
