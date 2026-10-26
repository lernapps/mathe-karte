// Übung „Prozentsatz berechnen“: p = W / G · 100, in fünf Kontexten (Jacke, Klasse, Umfrage, Akku, Basketball), mit
// Prozentbalken, der p erst nach der Lösung zeigt. Portiert aus aufgaben/prozentsatz.js der alten App.
import {
  type Antworten,
  type Aufgabe,
  type KontextId,
  KONTEXTE,
  RABATTE,
  beschreibe,
  bildWert,
  check,
  eingabeFuer,
  erzeugeTripel,
  eingabeVon,
  grundFuer,
  nurFalsche,
  platzhalter,
  solution,
  tabellenWert,
  vorlage,
  waehleKontext,
  zahlenfeld,
  zeige,
} from "./ProzentAufgabe.ts";
import {
  alsBruch,
  bruch,
  durch,
  erzeugeZufall,
  formatWert,
  formatZahl,
  gleichheitszeichen,
  mal,
  mitEinheit,
  passtZu,
  zahl,
} from "./ProzentKern.ts";

export { check, solution };

type Text = (g: string, w: string, anzahlG: string, anzahlW: string) => string;
const TEXTE: Readonly<Record<KontextId, Text>> = {
  preis: (g, w) => `Eine Jacke kostet ${g}. Der Rabatt beträgt ${w}. Wie viel Prozent Rabatt sind das?`,
  klasse: (g, w) => `In einer Klasse sind ${g}. ${w} davon haben ein Haustier. Wie viel Prozent der Klasse sind das?`,
  umfrage: (g, w) => `${g} wurden befragt, ${w} davon mögen Pizza am liebsten. Wie viel Prozent sind das?`,
  akku: (g, w) =>
    `Ein Akku fasst ${g} (Milliamperestunden: so viel Ladung speichert der Akku). Er ist noch mit ${w} geladen. Wie viel Prozent sind das?`,
  sport: (_g, _w, anzahlG, anzahlW) =>
    `Tom wirft ${anzahlG}-mal auf den Korb und trifft ${anzahlW}-mal. Wie viel Prozent seiner Würfe sind Treffer?`,
};

/** Die Einheit des Prozentwerts: Treffer statt Würfe. */
const wEinheitVon = (kontext: KontextId, einheit: string): string => (kontext === "sport" ? "Treffer" : einheit);
const einheitVon = (kontext: KontextId): string => KONTEXTE.find((k) => k.id === kontext)?.einheit ?? "";

export interface ProzentsatzAufgabe extends Aufgabe {
  kontext: KontextId;
  grundwert: number;
  prozentwert: number;
}

export function generate(seed: number): ProzentsatzAufgabe {
  const zufall = erzeugeZufall(seed, "prozentsatz");
  const kontext = waehleKontext(zufall, undefined, { preis: { min: 30, max: 300, saetze: RABATTE } });
  const { grundwert, prozentsatz, prozentwert } = erzeugeTripel(zufall, kontext);
  const einheit = kontext.einheit;
  const wEinheit = wEinheitVon(kontext.id, einheit);
  const exakt = mal(durch(alsBruch(prozentwert), alsBruch(grundwert)), bruch(100));
  const zeichen = gleichheitszeichen(zahl(exakt), prozentsatz);
  const teil = bildWert(prozentwert, wEinheit);
  const rechts = `100 % = ${bildWert(grundwert, einheit)}`;
  return {
    kontext: kontext.id,
    grundwert,
    prozentwert,
    text: TEXTE[kontext.id](
      mitEinheit(grundwert, einheit),
      mitEinheit(prozentwert, wEinheit),
      formatZahl(grundwert),
      formatZahl(prozentwert),
    ),
    felder: [zahlenfeld("prozentsatz", "Prozentsatz p", "%", "prozent", exakt)],
    // ungelöst bleibt der Balken leer: an der Füllung ließe sich p sonst ablesen
    bild: { art: "prozentbalken", prozent: 0, links: "0 %", rechts, mitte: `${teil} = ? %` },
    bildGeloest: {
      art: "prozentbalken",
      prozent: prozentsatz,
      links: "0 %",
      rechts,
      mitte: `${teil} = ${formatZahl(prozentsatz)} %`,
    },
    tipp: `Der Grundwert ist das Ganze: ${mitEinheit(grundwert, einheit)} sind 100 %. Teile den Teil (${mitEinheit(prozentwert, wEinheit)}) durch das Ganze und nimm das Ergebnis mal 100.`,
    rechenweg: [
      "p = W / G · 100",
      `p = ${formatWert(prozentwert, einheit)} / ${formatWert(grundwert, einheit)} · 100 ${zeichen} ${formatZahl(prozentsatz)}`,
      `p % ${zeichen} ${formatZahl(prozentsatz)} %`,
    ],
    richtig: `Ergebnis: ${formatZahl(prozentsatz)} %.`,
  };
}

export const MELDUNGEN = {
  dezimalStattProzent: "Das ist der Anteil als Dezimalzahl. Mal 100 nehmen, dann hast du den Prozentsatz.",
  bezugVerwechselt: "Du hast das Ganze durch den Teil geteilt. Richtig ist: Teil durch Ganzes (W / G).",
  falsch: "Das stimmt noch nicht. Rechne: Teil geteilt durch Ganzes, dann mal 100.",
};

/** Was an einer falschen Antwort falsch ist. */
export function grund(aufgabe: ProzentsatzAufgabe, antwort: unknown): string {
  const [feld] = aufgabe.felder;
  if (feld?.typ !== "zahl") return MELDUNGEN.falsch;
  return grundFuer(
    aufgabe,
    antwort,
    (antworten: Antworten) => {
      const eingabe = antworten["prozentsatz"];
      if (passtZu(eingabe, durch(feld.exakt, bruch(100)), feld.art)) return MELDUNGEN.dezimalStattProzent;
      const umgekehrt = mal(durch(alsBruch(aufgabe.grundwert), alsBruch(aufgabe.prozentwert)), bruch(100));
      if (passtZu(eingabe, umgekehrt, feld.art)) return MELDUNGEN.bezugVerwechselt;
      return undefined;
    },
    MELDUNGEN.falsch,
  );
}

/** Die Meldung der App zu einer falschen Antwort (Vertrag der Übung): grund. */
export const reason = (aufgabe: ProzentsatzAufgabe, antwort: unknown, _props?: unknown, _lang?: string): string =>
  grund(aufgabe, antwort);

/** Die Antwort jedes typischen Fehlers aus about.mistakes: der Anteil als Dezimalzahl, Ganzes durch Teil. */
export function mistakes(aufgabe: ProzentsatzAufgabe, _props?: unknown): (Antworten | undefined)[] {
  const [feld] = aufgabe.felder;
  if (feld?.typ !== "zahl") return [undefined, undefined];
  const umgekehrt = mal(durch(alsBruch(aufgabe.grundwert), alsBruch(aufgabe.prozentwert)), bruch(100));
  return nurFalsche(aufgabe, [
    eingabeVon(aufgabe, "prozentsatz", durch(feld.exakt, bruch(100))),
    eingabeVon(aufgabe, "prozentsatz", umgekehrt),
  ]);
}

/** Die Fassungen des Textes, je Kontext, mit {G} und {W}. */
export const fassungen = (): Record<string, string> =>
  Object.fromEntries(
    KONTEXTE.map((k) => [
      k.id,
      TEXTE[k.id](platzhalter("G", k.einheit), platzhalter("W", wEinheitVon(k.id, k.einheit)), "{G}", "{W}"),
    ]),
  );

/** Die Aufgabe, wie das Kind sie liest, mit {Fassung}, {G} und {W}. */
export const template = (_props?: unknown, _lang?: string): string =>
  vorlage(fassungen(), "Gesucht ist der Prozentsatz p in %.");

/** Was eine Aufgabe festlegt: die Fassung des Textes, Grundwert und Prozentwert. */
export function params(aufgabe: ProzentsatzAufgabe, _props?: unknown, _lang?: string): Record<string, string> {
  const einheit = einheitVon(aufgabe.kontext);
  return {
    Fassung: aufgabe.kontext,
    G: tabellenWert(aufgabe.grundwert, einheit),
    W: tabellenWert(aufgabe.prozentwert, wEinheitVon(aufgabe.kontext, einheit)),
  };
}

/** Eine Antwort als Text, wie das Kind sie beschreibt. */
export const show = (antwort: unknown, aufgabe: ProzentsatzAufgabe, _props?: unknown, _lang?: string): string =>
  zeige(aufgabe, antwort);

/** Die typische falsche Antwort: der Anteil als Dezimalzahl, nicht mal 100. */
export function wrong(aufgabe: ProzentsatzAufgabe): Antworten {
  const [feld] = aufgabe.felder;
  return { prozentsatz: feld?.typ === "zahl" ? eingabeFuer(zahl(feld.exakt) / 100) : "0" };
}

export function describe(aufgabe: ProzentsatzAufgabe): { task: string; solution: string } {
  return beschreibe(aufgabe);
}

export const about = {
  task: "Eine Textaufgabe: Grundwert und Prozentwert sind gegeben, der Prozentsatz ist gesucht. Das Bild zur Aufgabe ist ein Prozentbalken, der erst nach der Lösung gefüllt ist.",
  answer:
    "Der Prozentsatz als Zahl in Prozent (ohne oder mit %-Zeichen), ins Feld getippt, dann „Prüfen“ unter der Aufgabe; Komma oder Punkt, ein Bruch oder ein Term gehen auch.",
  correct:
    "Richtig ist p = W / G · 100: exakt, oder kaufmännisch gerundet auf mindestens eine Nachkommastelle, wenn gerundet werden muss.",
  mistakes: [MELDUNGEN.dezimalStattProzent, MELDUNGEN.bezugVerwechselt],
};
