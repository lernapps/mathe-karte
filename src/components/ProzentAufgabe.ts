// Was alle Prozent-Übungen teilen: die Form einer Aufgabe (Felder, Bild, Tipp, Rechenweg), ihre Prüfung, ihre
// Beschreibung für die Seite ohne JavaScript und den Tutor, und die „schönen“ Zahlen und Kontexte (gemeinsam.js der
// alten App). Rein, ohne DOM; jede Aufgabe ist JSON.
import {
  type Art,
  type Bruch,
  type Urteil,
  type Zufall,
  formatWert,
  formatZahl,
  loesungsText,
  mitEinheit,
  MELDUNG_KEINE_ZAHL,
  pruefeZahl,
  runde,
  rundungsHinweis,
  STELLEN,
} from "./ProzentKern.ts";

export interface Option {
  wert: string;
  text: string;
}

/** Ein Zahlenfeld mit seinem exakten Wert, oder eine Auswahl (Liste oder Knöpfe) mit dem richtigen Wert. */
export type Feld =
  | {
      typ: "zahl";
      id: string;
      label: string;
      einheit: string;
      art: Art;
      stellen: number;
      hinweis: string;
      exakt: Bruch;
      loesung: string;
    }
  | { typ: "auswahl" | "knoepfe"; id: string; label: string; optionen: Option[]; loesung: string };

/** Ein Balken des Balkenbilds; wert null: unbekannt, der Balken bleibt leer. */
export interface Balken {
  wert: number | null;
  grau: boolean;
  text: string;
}

/** Das Bild zur Aufgabe: Hunderterfeld, Prozentbalken (0 bis 100 %) oder waagerechte Balken zum Vergleich. */
export type Bild =
  | { art: "raster"; gefuellt: number; titel: string; untertitel: string }
  | { art: "prozentbalken"; prozent: number; links: string; rechts: string; mitte: string }
  | { art: "balken"; titel: string; balken: Balken[] };

/** Eine Aufgabe: Text, Felder, das Bild vor und nach der Lösung, Tipp, Rechenweg und der Satz zur richtigen Antwort. */
export interface Aufgabe {
  text: string;
  felder: Feld[];
  bild: Bild;
  bildGeloest: Bild;
  tipp: string;
  rechenweg: string[];
  richtig: string;
}

/** Die Antworten der Felder, nach ihrer id. */
export type Antworten = Record<string, string>;

/** Ein Zahlenfeld mit Stellen und Rundungshinweis nach seiner Art. */
export function zahlenfeld(id: string, label: string, einheit: string, art: Art, exakt: Bruch): Feld {
  const stellen = STELLEN[art];
  return {
    typ: "zahl",
    id,
    label,
    einheit,
    art,
    stellen,
    hinweis: rundungsHinweis(art, stellen, exakt),
    exakt,
    loesung: loesungsText(exakt, art, stellen),
  };
}

/** Die Antworten als Record, was immer übergeben wurde (ein Beispiel der Seite kann alles sein). */
export function alsAntworten(antwort: unknown): Antworten {
  if (typeof antwort !== "object" || antwort === null || Array.isArray(antwort)) return {};
  return Object.fromEntries(Object.entries(antwort).map(([id, wert]) => [id, typeof wert === "string" ? wert : ""]));
}

/** Das Urteil über ein Feld. */
export function urteil(feld: Feld, eingabe: string | undefined): Urteil {
  if (feld.typ === "zahl") return pruefeZahl(eingabe ?? "", feld.exakt, feld.art, feld.stellen);
  if (!eingabe) return { status: "leer", meldung: "Bitte wähle bei jedem Feld etwas aus." };
  return { status: eingabe === feld.loesung ? "richtig" : "falsch" };
}

/** Richtig, wenn jedes Feld stimmt. */
export function check(aufgabe: Aufgabe, antwort: unknown): boolean {
  const antworten = alsAntworten(antwort);
  return aufgabe.felder.every((feld) => urteil(feld, antworten[feld.id]).status === "richtig");
}

/** Die richtigen Antworten, wie man sie eingibt. */
export function solution(aufgabe: Aufgabe): Antworten {
  return Object.fromEntries(aufgabe.felder.map((feld) => [feld.id, feld.loesung]));
}

/**
 * Der Grund einer falschen Antwort: ein leeres Feld oder ein Hinweis (fast richtig) zuerst, dann die Diagnose der
 * Übung (`diagnose`), sonst `falsch`.
 */
export function grundFuer(
  aufgabe: Aufgabe,
  antwort: unknown,
  diagnose: (antworten: Antworten) => string | undefined,
  falsch: string,
): string {
  const antworten = alsAntworten(antwort);
  const urteile = aufgabe.felder.map((feld) => urteil(feld, antworten[feld.id]));
  const leer = urteile.find((u) => u.status === "leer");
  if (leer?.meldung) return leer.meldung;
  const hinweis = urteile.find((u) => u.status === "hinweis");
  if (hinweis?.meldung && urteile.every((u) => u.status !== "falsch")) return hinweis.meldung;
  return diagnose(antworten) ?? falsch;
}

/** Was das Bild zeigt, in Worten: für Screenreader und die Seite ohne JavaScript. */
export function bildText(bild: Bild): string {
  if (bild.art === "raster") {
    return `Hunderterfeld: ${formatZahl(bild.gefuellt)} von 100 Kästchen sind blau. ${bild.titel}; ${bild.untertitel}.`;
  }
  if (bild.art === "prozentbalken") {
    return `Prozentbalken von 0 % bis 100 %, ${formatZahl(bild.prozent)} % sind blau. Über dem Balken: ${bild.mitte}. Rechts: ${bild.rechts}.`;
  }
  return `Balkenbild „${bild.titel}“: ${bild.balken.map((b) => b.text).join("; ")}.`;
}

/** Ein Feld, wie es ohne JavaScript beschrieben wird. */
function feldText(feld: Feld): string {
  if (feld.typ === "zahl") {
    const einheit = feld.einheit ? ` (in ${feld.einheit})` : "";
    return `${feld.label}${einheit}${feld.hinweis ? `. ${feld.hinweis}` : ""}`;
  }
  return `${feld.label} Zur Wahl: ${feld.optionen.map((o) => `„${o.text}“`).join(", ")}`;
}

/** Aufgabe und Lösung als eingeschränktes Markdown, so wie die Übung sie zeigt. */
export function beschreibe(aufgabe: Aufgabe): { task: string; solution: string } {
  const felder = aufgabe.felder.map((feld) => `- ${feldText(feld)}`).join("\n");
  const antworten = aufgabe.felder
    .map((feld) => {
      const wert =
        feld.typ === "zahl" ? feld.loesung : (feld.optionen.find((o) => o.wert === feld.loesung)?.text ?? "");
      return `- ${feld.label.replace(/\s*[?…:]$/, "")}: ${wert}${feld.typ === "zahl" && feld.einheit ? ` ${feld.einheit}` : ""}`;
    })
    .join("\n");
  return {
    task: `${aufgabe.text}\n\nBild zur Aufgabe: ${bildText(aufgabe.bild)}\n\n${felder}`,
    solution: `${antworten}\n\nRechenweg:\n\n${aufgabe.rechenweg.map((zeile) => `- ${zeile}`).join("\n")}\n\n${aufgabe.richtig}`,
  };
}

export { MELDUNG_KEINE_ZAHL };

// Die Eingabe der Übung (ProzentUebung.vue) und die Tabelle der Aufgaben für den Tutor

/** Ob das Kind schon etwas eingegeben oder gewählt hat; sonst gibt die Übung keine Antwort weiter. */
export const hatEingabe = (antworten: Readonly<Antworten>): boolean =>
  Object.values(antworten).some((wert) => wert.trim() !== "");

/** Eine Auswahl kurz, wie das Kind sie nennt: „Grundwert G“ statt „Grundwert G (das Ganze, 100 %)“. */
const kurz = (text: string): string => text.replace(/\s*\(.*\)$/, "");

/**
 * Eine Antwort als kurzer Text, wie das Kind sie beschreibt: jede Zahl mit der Einheit ihres Felds, jede Auswahl mit
 * ihrem Text; bei mehreren Feldern jedes mit seiner Beschriftung, ein leeres als „leer“.
 */
export function zeige(aufgabe: Aufgabe, antwort: unknown): string {
  const antworten = alsAntworten(antwort);
  const teile = aufgabe.felder.map((feld) => {
    const eingabe = (antworten[feld.id] ?? "").trim();
    let wert = "leer";
    if (feld.typ === "zahl") {
      if (eingabe !== "")
        wert = feld.einheit === "" || eingabe.endsWith(feld.einheit) ? eingabe : `${eingabe} ${feld.einheit}`;
    } else if (eingabe !== "") {
      wert = kurz(feld.optionen.find((option) => option.wert === eingabe)?.text ?? eingabe);
    }
    if (aufgabe.felder.length === 1) return wert;
    // „1 % sind 26 mAh“, „490 € ist Grundwert G“, sonst „Ergebnis (W): 10 €“
    const label = feld.label.replace(/\s*[?:…]$/, "");
    return /\s(sind|ist)$/.test(label) ? `${label} ${wert}` : `${label}: ${wert}`;
  });
  return teile.join("; ");
}

/** Die Antworten typischer Fehler; eine, die zufällig richtig ist, gilt nicht (undefined). */
export const nurFalsche = (
  aufgabe: Aufgabe,
  antworten: readonly (Antworten | undefined)[],
): (Antworten | undefined)[] => antworten.map((a) => (a === undefined || check(aufgabe, a) ? undefined : a));

/** Die Eingabe für den Wert `wert` eines Zahlenfelds, so wie das Kind sie tippt (gerundet wie die Lösung). */
export function eingabeVon(aufgabe: Aufgabe, id: string, wert: Bruch): Antworten {
  const feld = aufgabe.felder.find((f) => f.id === id);
  return { [id]: feld?.typ === "zahl" ? loesungsText(wert, feld.art, feld.stellen) : "" };
}

/** Der Platzhalter {name} einer Zahl mit ihrer Einheit, so wie mitEinheit sie schreibt: „{G} €“. */
export const platzhalter = (name: string, einheit = ""): string =>
  mitEinheit(0, einheit).replace(formatWert(0, einheit), `{${name}}`);

/** Eine Zahl als Wert der Tabelle, so wie der Text der Aufgabe sie schreibt (ohne Einheit). */
export const tabellenWert = (x: number, einheit = ""): string => formatWert(x, einheit);

/**
 * Die Aufgabe für den Tutor, einmal: welche Fassung des Textes gilt ({Fassung}), jede Fassung mit ihren
 * Platzhaltern, dann was das Kind tut.
 */
export function vorlage(fassungen: Readonly<Record<string, string>>, auftrag: string): string {
  const liste = Object.entries(fassungen).map(([name, text]) => `${name}: „${text}“`);
  return `Der Text der Aufgabe ist je nach {Fassung} einer von diesen: ${liste.join(" ")} ${auftrag}`;
}

/** Ein Text mit {name} für jeden Wert aus `werte`, ausgefüllt. */
export const fuelle = (text: string, werte: Readonly<Record<string, string | number>>): string =>
  text.replace(/\{([^{}\s]+)\}/g, (platz, name: string) => String(werte[name] ?? platz));

// Schöne Zahlen und Kontexte

export const PROZENTSAETZE = [
  2, 3, 4, 5, 6, 8, 10, 12, 12.5, 15, 18, 20, 24, 25, 30, 35, 40, 45, 50, 60, 65, 70, 75, 80, 85, 90, 95,
];
/** Rabatte, wie sie im Laden vorkommen: 5 bis 50 %. */
export const RABATTE = PROZENTSAETZE.filter((p) => p >= 5 && p <= 50);

export type KontextId = "preis" | "klasse" | "umfrage" | "akku" | "sport";

/** Ein Kontext: Einheit und plausibler Bereich des Grundwerts, Nachkommastellen, Schritt, eigene Prozentsätze. */
export interface Kontext {
  id: KontextId;
  einheit: string;
  min: number;
  max: number;
  nachkomma: number;
  schritt: number;
  saetze?: readonly number[];
}

export const KONTEXTE: readonly Kontext[] = [
  { id: "preis", einheit: "€", min: 20, max: 1500, nachkomma: 1, schritt: 5 },
  { id: "klasse", einheit: "Schüler", min: 16, max: 32, nachkomma: 0, schritt: 1 },
  { id: "umfrage", einheit: "Personen", min: 50, max: 1000, nachkomma: 0, schritt: 10 },
  { id: "akku", einheit: "mAh", min: 2000, max: 5000, nachkomma: 0, schritt: 100 },
  { id: "sport", einheit: "Würfe", min: 10, max: 60, nachkomma: 0, schritt: 1 },
];

/** Andere Bereiche für einzelne Kontexte, passend zum Ding im Text (eine Jacke kostet 30 bis 300 €). */
export type Bereiche = Partial<Record<KontextId, Partial<Kontext>>>;

const ggt = (a: number, b: number): number => (b === 0 ? a : ggt(b, a % b));
const kgv = (a: number, b: number): number => (a * b) / ggt(a, b);

/** Das kleinste Vielfache, das der Grundwert haben muss, damit G · p / 100 höchstens `nachkomma` Stellen hat. */
export function basisFuer(prozentsatz: number, nachkomma = 0): number {
  const nenner = 1000 / 10 ** nachkomma;
  return nenner / ggt(Math.round(prozentsatz * 10), nenner);
}

/** Ein Grundwert im Bereich, Vielfaches der Basis und des Schritts; undefined, wenn keiner passt. */
export function waehleGrundwert(zufall: Zufall, prozentsatz: number, k: Omit<Kontext, "id">): number | undefined {
  const basis = kgv(basisFuer(prozentsatz, k.nachkomma), k.schritt);
  const kMin = Math.ceil(k.min / basis);
  const kMax = Math.floor(k.max / basis);
  return kMin > kMax ? undefined : zufall.ganzzahl(kMin, kMax) * basis;
}

/** Ein Kontext aus `ids` (sonst allen), mit seinem Bereich aus `bereiche`. */
export function waehleKontext(zufall: Zufall, ids?: readonly KontextId[], bereiche: Bereiche = {}): Kontext {
  const auswahl = ids ? KONTEXTE.filter((k) => ids.includes(k.id)) : KONTEXTE;
  const kontext = zufall.wahl(auswahl);
  return { ...kontext, ...bereiche[kontext.id] };
}

/** Grundwert, Prozentsatz und Prozentwert, die zusammen schön sind. */
export function erzeugeTripel(
  zufall: Zufall,
  kontext: Kontext,
): { grundwert: number; prozentsatz: number; prozentwert: number } {
  for (let versuch = 0; versuch < 50; versuch++) {
    const prozentsatz = zufall.wahl(kontext.saetze ?? PROZENTSAETZE);
    const grundwert = waehleGrundwert(zufall, prozentsatz, kontext);
    if (grundwert === undefined) continue;
    return { grundwert, prozentsatz, prozentwert: runde((grundwert * prozentsatz) / 100, kontext.nachkomma) };
  }
  // 50 % einer geraden Zahl ist immer schön
  const grundwert = 2 * zufall.ganzzahl(Math.ceil(kontext.min / 2), Math.floor(kontext.max / 2));
  return { grundwert, prozentsatz: 50, prozentwert: grundwert / 2 };
}

const DATIV: Readonly<Record<string, string>> = { Würfe: "Würfen", Schüler: "Schülern" };
/** Die Einheit nach „von“: „65 % von 60 Würfen“. */
export const imDativ = (einheit: string): string => DATIV[einheit] ?? einheit;

/** Wert mit Einheit für Bilder: Geld mit Cent wie im Text, normales Leerzeichen. */
export const bildWert = (x: number, einheit: string): string => `${formatWert(x, einheit)} ${einheit}`.trim();

/** Eine Zahleneingabe aus einem Wert, wie sie ein Kind tippt (für wrong und Tests). */
export const eingabeFuer = (x: number): string => String(runde(x, 6)).replace(".", ",");

const textBreite = (text: string): number => text.length * SCHRIFT * 0.6;

/** Bricht eine zu lange Beschriftung um: bevorzugt nach „:“, vor „–“ oder „=“, sonst am letzten passenden Leerzeichen. */
export function umbrechen(text: string, max: number): string[] {
  if (textBreite(text) <= max) return [text];
  for (const [trenner, links] of [
    [": ", ":"],
    [" – ", ""],
    [" = ", ""],
  ] as const) {
    const i = text.indexOf(trenner);
    if (i > 0) {
      const erste = text.slice(0, i) + links;
      const zweite = links ? text.slice(i + trenner.length) : text.slice(i + 1);
      if (textBreite(erste) <= max && textBreite(zweite) <= max) return [erste, zweite];
    }
  }
  const woerter = text.split(" ");
  let erste = woerter.shift() ?? "";
  while (woerter.length > 0 && textBreite(`${erste} ${woerter[0] ?? ""}`) <= max) erste += ` ${woerter.shift() ?? ""}`;
  return [erste, woerter.join(" ")];
}

// Lage der Bildteile (ProzentBild.vue zeichnet sie): Schriftgröße und Breite der Balken in SVG-Einheiten.
export const SCHRIFT = 15;
export const BREITE = 320;

/** Die 100 Kästchen des Hunderterfelds; das Kästchen nach den vollen ist anteilig gefüllt (12,5 %: ein halbes). */
export function rasterKaestchen(gefuellt: number): { x: number; y: number; voll: boolean; teil: number }[] {
  const p = Math.max(0, Math.min(100, gefuellt));
  return Array.from({ length: 100 }, (_, i) => ({
    x: 10 + (i % 10) * 24,
    y: 10 + Math.floor(i / 10) * 24,
    voll: i < Math.floor(p),
    teil: i === Math.floor(p) ? p - Math.floor(p) : 0,
  }));
}

/** Breite der Füllung und Lage der Beschriftung über dem Prozentbalken, die nie über den Rand ragt. */
export function prozentbalkenLage(prozent: number, mitte: string): { breite: number; mitteX: number } {
  const p = Math.max(0, Math.min(100, prozent));
  const halb = textBreite(mitte) / 2;
  return { breite: 3.2 * p, mitteX: Math.min(Math.max(10 + 3.2 * p, 10 + halb), 330 - halb) };
}

/** Die Balken untereinander: der längste füllt die Breite, ein unbekannter bleibt leer, Beschriftungen brechen um. */
export function balkenLage(balken: readonly Balken[]): {
  zeilen: { oben: number; breite: number; grau: boolean; texte: { zeile: string; y: number }[] }[];
  hoehe: number;
} {
  const max = Math.max(...balken.map((b) => b.wert ?? 0), 1);
  let y = 28;
  const zeilen = balken.map((b) => {
    const oben = y;
    y += 30;
    const texte = umbrechen(b.text, BREITE).map((zeile) => {
      y += 19;
      return { zeile, y };
    });
    y += 14;
    return { oben, breite: b.wert === null ? 0 : Math.max(2, (b.wert / max) * BREITE), grau: b.grau, texte };
  });
  return { zeilen, hoehe: y };
}
