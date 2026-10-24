// Die Logik der Übung BinomTermAufgabe.vue: eine Termaufgabe zur Aufgabennummer (seed), ihre Prüfung mit Diagnose
// typischer Fehler, Lösung, ein falsches Beispiel, die Beschreibung für Tutor und Seite ohne JavaScript und was die
// Übung ist (about). Die Aufgaben selbst baut BinomFormeln.ts, je nach Art (Prop art).
import { erzeugeTermAufgabe, type Art, type TermAufgabe } from "./BinomFormeln.ts";
import { leseTerm } from "./BinomParser.ts";
import {
  erzeugeZufall,
  istBinomProdukt,
  leseGanzzahl,
  pruefeTerm,
  schrittMarkdown,
  sindGleichwertig,
  zuLatex,
} from "./BinomTerm.ts";

export { schrittText } from "./BinomTerm.ts";

export type { TermAufgabe };

/** Die Beschriftung des Eingabefelds. */
export const feldLabel = (aufgabe: TermAufgabe): string => (aufgabe.zahl ? "Zahl in der Lücke" : `${aufgabe.term} =`);

/** Wie man die Antwort tippt. */
export const eingabeHinweis = (aufgabe: TermAufgabe): string =>
  aufgabe.zahl
    ? "Nur die Zahl, z. B. 16."
    : aufgabe.form === "faktorisiert"
      ? "Schreib ein Produkt, z. B. (x+3)^2 oder (x+4)(x-4)."
      : "Hoch 2 tippst du als ^2, z. B. x^2 + 8x + 15.";

/** Was die Übung aus der Eingabe gelesen hat: "Gelesen: x² + 6x + 9", eine Meldung bei Syntaxfehlern, sonst "". */
export function vorschau(aufgabe: TermAufgabe, antwort: string): string {
  if (aufgabe.zahl || antwort.trim() === "") return "";
  const gelesen = leseTerm(antwort);
  return gelesen.fehler === undefined ? `Gelesen: ${gelesen.text}` : gelesen.meldung;
}

export interface TermProps {
  art: Art;
}

export function generate(seed: number, props: TermProps): TermAufgabe {
  return erzeugeTermAufgabe(props.art, erzeugeZufall(seed));
}

const MELDUNG_NICHT_BINOM = "Der Term stimmt – schreib ihn als binomische Formel, z. B. (x + 3)² oder (x + 4)(x − 4).";
const MELDUNG_KEINE_ZAHL = "Schreib eine ganze Zahl in die Lücke, z. B. 12.";
const FALSCH: Record<Art, string> = {
  klammern: "Das stimmt noch nicht. Schreib die vier Produkte einzeln auf und fasse dann zusammen.",
  erste: "Das stimmt noch nicht. Bestimme a und b und rechne a² + 2ab + b².",
  zweite: "Das stimmt noch nicht. Bestimme a und b und rechne a² − 2ab + b².",
  dritte: "Das stimmt noch nicht. Bestimme a und b und rechne a² − b².",
  rueckwaerts: "Das stimmt noch nicht. Welche Terme ergeben quadriert das erste und das letzte Glied?",
};

/** Passt die Antwort zum Kandidaten: bei einer Lücke dieselbe Zahl, sonst ein gleichwertiger Term. */
function passt(aufgabe: TermAufgabe, antwort: string, kandidat: string): boolean {
  if (aufgabe.zahl) return leseGanzzahl(antwort) === Number(kandidat);
  return sindGleichwertig(antwort, kandidat);
}

export function check(aufgabe: TermAufgabe, antwort: string): boolean {
  if (aufgabe.zahl) return leseGanzzahl(antwort) === Number(aufgabe.loesung);
  const ergebnis = pruefeTerm(antwort, aufgabe.loesung, aufgabe.form);
  return ergebnis.korrekt && (aufgabe.form === "ausmultipliziert" || istBinomProdukt(antwort));
}

/** Warum die Antwort nicht stimmt: Lesefehler, Form oder der passende typische Fehler; "" bei einer richtigen. */
export function grund(aufgabe: TermAufgabe, antwort: string): string {
  if (check(aufgabe, antwort)) return "";
  if (aufgabe.zahl && leseGanzzahl(antwort) === undefined) return MELDUNG_KEINE_ZAHL;
  if (!aufgabe.zahl) {
    const ergebnis = pruefeTerm(antwort, aufgabe.loesung, aufgabe.form);
    if (aufgabe.form === "faktorisiert" && (ergebnis.korrekt || ergebnis.fehler === "nicht-faktorisiert")) {
      return MELDUNG_NICHT_BINOM;
    }
    if (ergebnis.fehler !== "falsch") return ergebnis.meldung ?? FALSCH[aufgabe.art];
  }
  const fehler = aufgabe.fehler.find((f) =>
    f.kandidaten.some((k) => !passt(aufgabe, aufgabe.loesung, k) && passt(aufgabe, antwort, k)),
  );
  return fehler?.meldung ?? FALSCH[aufgabe.art];
}

export function solution(aufgabe: TermAufgabe): string {
  return aufgabe.loesung;
}

/** Ein typischer Fehlterm der Aufgabe, der nicht zufällig richtig ist; sonst die Lösung plus 1. */
export function wrong(aufgabe: TermAufgabe): string {
  const kandidat = aufgabe.fehler.flatMap((f) => f.kandidaten).find((k) => !passt(aufgabe, aufgabe.loesung, k));
  if (kandidat !== undefined) return kandidat;
  return aufgabe.zahl ? String(Number(aufgabe.loesung) + 1) : `${aufgabe.loesung}+1`;
}

export function describe(aufgabe: TermAufgabe, _props: TermProps, _lang: string): { task: string; solution: string } {
  const eingabe = aufgabe.zahl ? "Gib die Zahl in der Lücke ein." : "Gib das Ergebnis als Term ein.";
  return {
    task: `${aufgabe.frage} $${zuLatex(aufgabe.term)}$. ${eingabe}`,
    solution: [`$${zuLatex(aufgabe.ergebnis)}$`, ...aufgabe.schritte.map((s) => `- ${schrittMarkdown(s)}`)].join("\n"),
  };
}

export const about = {
  task: "Du formst einen Term mit Klammern um: zwei Klammern ausmultiplizieren, ein Binom mit der ersten, zweiten oder dritten binomischen Formel ausmultiplizieren, oder rückwärts eine Summe als binomische Formel schreiben oder die Zahl in einer Lücke ergänzen.",
  answer:
    "Ein Term, getippt mit ^2 für hoch 2 (z. B. x^2+6x+9 oder (x+3)^2, Malzeichen dürfen fehlen), bei einer Lücke eine ganze Zahl.",
  correct:
    "Jeder Term, der dem richtigen gleichwertig ist und in der verlangten Form dasteht: ausmultipliziert und zusammengefasst, beim Rückwärts-Rechnen als Binom-Produkt wie (x + 3)² oder (x + 4)(x − 4). Die Reihenfolge der Glieder ist egal.",
  mistakes: [
    "Das Mittelglied 2ab vergessen: (x + 3)² = x² + 9.",
    "Nur einmal ab statt 2ab: (x + 3)² = x² + 3x + 9.",
    "Bei (a − b)² das letzte Glied negativ geschrieben oder das Mittelglied mit Plus.",
    "Bei der dritten Formel ein Mittelglied geschrieben oder a² + b² statt a² − b².",
    "Die Zahl vor der Variable nicht quadriert: (3a)² = 3a² statt 9a².",
    "Klammer mal Klammer: nur die äußeren Glieder multipliziert oder ein Vorzeichen falsch.",
    "Rückwärts: das Mittelglied nicht halbiert, z. B. (x + 6)² für x² + 6x + 9, oder die falsche Formel gewählt.",
  ],
};
