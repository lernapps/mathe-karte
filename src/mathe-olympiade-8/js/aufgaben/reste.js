/*
 * Kompetenz: Reste und Fallunterscheidung – mit Resten statt mit Zahlen rechnen; Endziffern von Potenzen.
 * Reine Funktionen, kein DOM, deterministisch über `zufall`.
 * URL-Parameter (öffentlicher Vertrag, in llms.txt dokumentiert): m (Teiler 3–12, wählt die Art „Rest“), seed.
 */
import { ganzzahlFeld, pruefeGanzzahl, rest } from "./mo.js";

export const THEMA = "reste";
export const URL_ZAHLEN = ["m"];
export const URL_TEXTE = [];

const HOCH = "⁰¹²³⁴⁵⁶⁷⁸⁹";
export const hoch = (k) => String(k).split("").map((z) => HOCH[Number(z)]).join("");

function restAufgabe(zufall, m) {
  const r = zufall.ganzzahl(1, m - 1);
  const c = zufall.ganzzahl(2, 5);
  const d = zufall.ganzzahl(1, 9);
  const roh = c * r + d;
  const antwort = rest(roh, m);
  return {
    art: "rest",
    m, r, c, d,
    text: `Eine natürliche Zahl x lässt bei Division durch ${m} den Rest ${r}. Welchen Rest lässt ${c} · x + ${d} bei Division durch ${m}? Begründe allgemein, für jedes solche x.`,
    loesung: { antwort },
    felder: [ganzzahlFeld(`Rest bei Division durch ${m}`, antwort)],
    tipp: `Schreib x = ${m} · q + ${r}. Was wird dann aus ${c} · x + ${d}? Welcher Teil ist sicher durch ${m} teilbar?`,
    rechenweg: [
      `Weil x bei Division durch ${m} den Rest ${r} lässt, gibt es eine natürliche Zahl q mit x = ${m} · q + ${r}.`,
      `Dann ist ${c} · x + ${d} = ${m} · (${c} · q) + ${c} · ${r} + ${d} = ${m} · (${c} · q) + ${roh}.`,
      `Der erste Summand ist durch ${m} teilbar, also lässt ${c} · x + ${d} denselben Rest wie ${roh}.`,
      `${roh} = ${m} · ${Math.floor(roh / m)} + ${antwort}.`,
      `Antwort: ${c} · x + ${d} lässt bei Division durch ${m} immer den Rest <strong>${antwort}</strong>.`,
    ],
    uhr: { titel: `Reste bei Division durch ${m}`, labels: Array.from({ length: m }, (_, i) => String(i)), start: r, ziel: antwort, startText: "x", zielText: `${c}x + ${d}` },
  };
}

function endziffer(zufall) {
  const basis = zufall.wahl([2, 3, 7, 8]);
  const k = zufall.ganzzahl(21, 99);
  const zyklus = [1, 2, 3, 4].map((e) => (basis ** e) % 10);
  const s = rest(k - 1, 4) + 1;
  const antwort = zyklus[s - 1];
  const zahl = `${basis}${hoch(k)}`;
  return {
    art: "endziffer",
    basis, k, zyklus,
    text: `Ermittle die Einerziffer der Zahl ${zahl}.`,
    loesung: { antwort },
    felder: [ganzzahlFeld(`Einerziffer von ${zahl}`, antwort)],
    tipp: `Schreib die Einerziffern von ${basis}¹, ${basis}², ${basis}³, … auf. Was fällt dir auf? Nach wie vielen Schritten wiederholt es sich?`,
    rechenweg: [
      "Die Einerziffer eines Produkts hängt nur von den Einerziffern der Faktoren ab.",
      `Die Einerziffern von ${basis}¹, ${basis}², ${basis}³, ${basis}⁴ sind ${zyklus.join(", ")}. Weil ${basis}⁵ die Einerziffer von ${zyklus[3]} · ${basis} hat, also ${zyklus[0]}, wiederholen sie sich mit der Länge 4.`,
      `${k} = 4 · ${Math.floor((k - 1) / 4)} + ${s}. Also hat ${zahl} dieselbe Einerziffer wie ${basis}${hoch(s)}.`,
      `Antwort: Die Einerziffer von ${zahl} ist <strong>${antwort}</strong>.`,
    ],
    uhr: { titel: `Einerziffern von ${basis}¹, ${basis}², ${basis}³, ${basis}⁴`, labels: zyklus.map(String), start: 0, ziel: s - 1, startText: `${basis}¹`, zielText: zahl },
  };
}

export function erzeugeAufgabe(zufall, vorgaben = {}) {
  const m = vorgaben.m;
  if (Number.isInteger(m) && m >= 3 && m <= 12) return { thema: THEMA, ...restAufgabe(zufall, m) };
  const teil = zufall.wahl(["rest", "endziffer"]) === "rest" ? restAufgabe(zufall, zufall.wahl([5, 6, 7, 8, 9, 11])) : endziffer(zufall);
  return { thema: THEMA, ...teil };
}

const MELDUNGEN = {
  "nicht-reduziert": "Ein Rest ist immer kleiner als der Teiler. Wie oft passt der Teiler noch hinein?",
  "periode-verschoben": "Fast. Prüf deine Zählung: Welche Einerziffer gehört zur Hochzahl 1, welche zur Hochzahl 4?",
  falsch: "Das stimmt noch nicht. Rechne mit den Resten statt mit den ganzen Zahlen.",
};

export function pruefeAntwort(aufgabe, antworten) {
  const r = aufgabe.loesung.antwort;
  const diagnosen = aufgabe.art === "rest"
    ? [["nicht-reduziert", aufgabe.c * aufgabe.r + aufgabe.d]]
    : [["periode-verschoben", aufgabe.zyklus[aufgabe.k % 4]]];
  return pruefeGanzzahl(aufgabe, antworten, diagnosen, MELDUNGEN, `Die Antwort ist ${r}.`);
}
