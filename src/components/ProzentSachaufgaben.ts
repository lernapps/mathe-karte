// Übung „Sachaufgaben übersetzen“: Typ Gleichung (die passende Gleichung wählen und ausrechnen) und Typ Dreisatz
// (100 % → 1 % → p %), mit Hunderterfeld. Portiert aus aufgaben/sachaufgaben.js der alten App.
import {
  type Antworten,
  type Aufgabe,
  type Bild,
  type Feld,
  type KontextId,
  KONTEXTE,
  PROZENTSAETZE,
  RABATTE,
  beschreibe,
  bildWert,
  check,
  eingabeFuer,
  erzeugeTripel,
  grundFuer,
  imDativ,
  nurFalsche,
  platzhalter,
  solution,
  tabellenWert,
  urteil,
  vorlage,
  waehleKontext,
  zahlenfeld,
  zeige,
} from "./ProzentAufgabe.ts";
import {
  type Zufall,
  alsBruch,
  artFuer,
  bruch,
  durch,
  erzeugeZufall,
  formatGenau,
  formatWert,
  formatZahl,
  gleichheitszeichen,
  loesungsText,
  mal,
  mitEinheit,
  runde,
  zahl,
} from "./ProzentKern.ts";

export { check, solution };

type Gesucht = "W" | "G" | "p";
type Texte = Record<Gesucht, (g: string, w: string, p: string) => string>;
const TEXTE: Partial<Record<KontextId, Texte>> = {
  preis: {
    W: (g, _w, p) => `Ein Skateboard kostet ${g}. Es gibt ${p} Rabatt. Wie viel Euro Rabatt sind das?`,
    p: (g, w) => `Ein Skateboard kostet ${g}. Der Rabatt beträgt ${w}. Wie viel Prozent sind das?`,
    G: (_g, w, p) =>
      `Beim Kauf eines Skateboards sparst du ${w}. Das sind ${p} Rabatt. Wie viel hat es vorher gekostet?`,
  },
  umfrage: {
    W: (g, _w, p) => `${g} wurden befragt. ${p} davon treiben regelmäßig Sport. Wie viele Personen sind das?`,
    p: (g, w) => `${g} wurden befragt. ${w} davon treiben regelmäßig Sport. Wie viel Prozent sind das?`,
    G: (_g, w, p) => `${w} treiben regelmäßig Sport. Das sind ${p} aller Befragten. Wie viele Personen wurden befragt?`,
  },
};

/** Die richtige Gleichung und zwei Fallen (Formeln verwechselt) für das Gesuchte. */
function gleichungen(gesucht: Gesucht, G: string, W: string, P: string): { richtig: string; falsch: string[] } {
  if (gesucht === "W")
    return { richtig: `W = ${G} · ${P} / 100`, falsch: [`W = ${G} · 100 / ${P}`, `W = ${P} / ${G} · 100`] };
  if (gesucht === "G")
    return { richtig: `G = ${W} · 100 / ${P}`, falsch: [`G = ${W} · ${P} / 100`, `G = ${P} / ${W} · 100`] };
  return { richtig: `p = ${W} / ${G} · 100`, falsch: [`p = ${G} / ${W} · 100`, `p = ${G} · ${W} / 100`] };
}

/** Die Rollen der beiden Zahlen im Text, in ihrer Reihenfolge, je nach dem Gesuchten. */
const GEGEBEN: Readonly<Record<Gesucht, readonly [Gesucht, Gesucht]>> = { W: ["G", "p"], p: ["G", "W"], G: ["W", "p"] };

/** Der Text einer Dreisatz-Aufgabe zum Grundwert `g` (mit Einheit) und Prozentsatz `p` (mit %). */
function dreisatzText(kontext: KontextId, g: string, p: string): string {
  const ding = { preis: "Ein Laptop kostet", umfrage: "Befragt wurden", akku: "Der Akku fasst" }[kontext as "preis"];
  // Zählbares heißt „wie viele“
  const frage = { preis: "wie viel Euro", umfrage: "wie viele Personen", akku: "wie viel mAh" }[kontext as "preis"];
  const mah = kontext === "akku" ? " (Milliamperestunden: so viel Ladung speichert der Akku)" : "";
  return `${ding} ${g}${mah}. Rechne mit dem Dreisatz aus, ${frage} ${p} davon sind: 100 % sind ${g}.`;
}

export interface SachAufgabe extends Aufgabe {
  typ: "gleichung" | "dreisatz";
  /** Die Fassung des Textes: „preis-W“ oder „dreisatz-akku“. */
  fassung: string;
  /** Die beiden Zahlen im Text, in ihrer Reihenfolge, ohne Einheit. */
  zahlen: [string, string];
  /** Gleichung: die erste falsche Gleichung und ihr Ergebnis; Dreisatz: 1 % und p %, mal statt durch 100. */
  fehlweg: Antworten;
}

/** Das Hunderterfeld: das Gesuchte steht bis zur Lösung als „?“ darin, die Füllung verrät p nicht. */
function bilder(gesucht: Gesucht, g: number, w: number, p: number, einheit: string, wEinheit: string): [Bild, Bild] {
  const P = `${formatZahl(p)} %`;
  const G = bildWert(g, einheit);
  const W = bildWert(w, wEinheit);
  if (gesucht === "G") {
    const bild = (geloest: boolean): Bild => ({
      art: "raster",
      gefuellt: p,
      titel: `${P} = ${W}`,
      untertitel: `100 % = ${geloest ? G : "?"}`,
    });
    return [bild(false), bild(true)];
  }
  if (gesucht === "p") {
    const bild = (geloest: boolean): Bild => ({
      art: "raster",
      gefuellt: geloest ? p : 0,
      titel: `100 % = ${G}`,
      untertitel: `${W} = ${geloest ? P : "? %"}`,
    });
    return [bild(false), bild(true)];
  }
  const eins = g / 100;
  const einsText = runde(eins, 2) === eins ? bildWert(eins, einheit) : `${formatGenau(eins)} ${einheit}`.trim();
  const titel = `${P} von ${bildWert(g, imDativ(einheit))}`;
  return [
    { art: "raster", gefuellt: p, titel, untertitel: `ein Kästchen = 1 %, ${P} = ?` },
    { art: "raster", gefuellt: p, titel, untertitel: `1 % = ${einsText}, ${P} = ${bildWert(w, einheit)}` },
  ];
}

function aufgabeGleichung(zufall: Zufall): SachAufgabe {
  const kontext = waehleKontext(zufall, ["preis", "umfrage"], { preis: { min: 30, max: 300, saetze: RABATTE } });
  const { grundwert: g, prozentsatz: p, prozentwert: w } = erzeugeTripel(zufall, kontext);
  const gesucht = zufall.wahl<Gesucht>(["W", "G", "p"]);
  const einheit = kontext.einheit;
  const wEinheit = kontext.id === "umfrage" ? "Personen" : einheit;
  const texte = TEXTE[kontext.id] as Texte;
  const gl = gleichungen(gesucht, formatWert(g, einheit), formatWert(w, einheit), formatZahl(p));
  const optionen = zufall.mischen([gl.richtig, ...gl.falsch]).map((t) => ({ wert: t, text: t }));
  const [G, W, P, hundert] = [alsBruch(g), alsBruch(w), alsBruch(p), bruch(100)];
  const exakt = { W: durch(mal(G, P), hundert), G: durch(mal(W, hundert), P), p: mal(durch(W, G), hundert) }[gesucht];
  const ergebnisEinheit = gesucht === "p" ? "%" : einheit;
  const ergebnis = mitEinheit({ W: w, G: g, p }[gesucht], ergebnisEinheit);
  const [bild, bildGeloest] = bilder(gesucht, g, w, p, einheit, wEinheit);
  const wert = { G: g, W: w, p };
  const [rolle1, rolle2] = GEGEBEN[gesucht];
  const ohneEinheit = (rolle: Gesucht) => tabellenWert(wert[rolle], rolle === "p" ? "%" : einheit);
  const [falscheGleichung = ""] = gl.falsch;
  const falschesErgebnis = {
    W: durch(mal(G, hundert), P),
    G: durch(mal(W, P), hundert),
    p: mal(durch(G, W), hundert),
  }[gesucht];
  const was = { G: "das Ganze (Grundwert)", W: "der Teil (Prozentwert)", p: "der Anteil in Prozent (Prozentsatz)" }[
    gesucht
  ];
  const ergebnisFeld = zahlenfeld(
    "ergebnis",
    `Ergebnis (${gesucht})`,
    ergebnisEinheit,
    gesucht === "p" ? "prozent" : artFuer(einheit),
    exakt,
  );
  const falschEingabe =
    ergebnisFeld.typ === "zahl" ? loesungsText(falschesErgebnis, ergebnisFeld.art, ergebnisFeld.stellen) : "";
  return {
    typ: "gleichung",
    fassung: `${kontext.id}-${gesucht}`,
    zahlen: [ohneEinheit(rolle1), ohneEinheit(rolle2)],
    fehlweg: { gleichung: falscheGleichung, ergebnis: falschEingabe },
    text: texte[gesucht](mitEinheit(g, einheit), mitEinheit(w, wEinheit), mitEinheit(p, "%")),
    felder: [
      { typ: "knoepfe", id: "gleichung", label: "Welche Gleichung passt?", optionen, loesung: gl.richtig },
      ergebnisFeld,
    ],
    bild,
    bildGeloest,
    tipp: `Gesucht ist ${was}. Schreibe zuerst auf, was G, W und p sind, dann passt nur eine Gleichung.`,
    rechenweg: [`Gesucht: ${gesucht}`, `Gleichung: ${gl.richtig}`, `Ergebnis: ${ergebnis}`],
    richtig: `Ergebnis: ${ergebnis}.`,
  };
}

function aufgabeDreisatz(zufall: Zufall): SachAufgabe {
  const kontext = waehleKontext(zufall, ["preis", "umfrage", "akku"], { preis: { min: 300, max: 1500 } });
  const g = 100 * zufall.ganzzahl(Math.max(1, Math.ceil(kontext.min / 100)), Math.floor(kontext.max / 100));
  const p = zufall.wahl(PROZENTSAETZE);
  const einheit = kontext.einheit;
  const einsExakt = durch(alsBruch(g), bruch(100));
  const prozentExakt = mal(einsExakt, alsBruch(p));
  const w = runde((g * p) / 100, 2);
  const eins = zahl(einsExakt);
  const einsText = runde(eins, 2) === eins ? formatWert(eins, einheit) : formatGenau(eins);
  const P = `${formatZahl(p)} %`;
  const felder: Feld[] = [
    zahlenfeld("eins", "1 % sind", einheit, "zahl", einsExakt),
    zahlenfeld("prozent", `${P} sind`, einheit, "zahl", prozentExakt),
  ];
  const [bild, bildGeloest] = bilder("W", g, w, p, einheit, einheit);
  const malHundert = mal(alsBruch(g), bruch(100));
  return {
    typ: "dreisatz",
    fassung: `dreisatz-${kontext.id}`,
    zahlen: [tabellenWert(g, einheit), tabellenWert(p, "%")],
    fehlweg: {
      eins: loesungsText(malHundert, "zahl", 2),
      prozent: loesungsText(mal(malHundert, alsBruch(p)), "zahl", 2),
    },
    text: dreisatzText(kontext.id, mitEinheit(g, einheit), mitEinheit(p, "%")),
    felder,
    bild,
    bildGeloest,
    tipp: "Von 100 % auf 1 %: durch 100 teilen. Von 1 % auf p %: mal p nehmen.",
    // 1 % steht ungerundet (Geld mit Cent wie 2,50 €): mit genau dieser Zahl geht die nächste Zeile weiter
    rechenweg: [
      `100 % = ${mitEinheit(g, einheit)}`,
      `1 % = ${formatWert(g, einheit)} : 100 = ${einsText} ${einheit}`,
      `${P} = ${einsText} · ${formatZahl(p)} ${gleichheitszeichen(zahl(prozentExakt), w)} ${mitEinheit(w, einheit)}`,
    ],
    richtig: `Ergebnis: ${P} sind ${mitEinheit(w, einheit)}.`,
  };
}

/** Gleichung oder Dreisatz, je nach Aufgabennummer. */
export function generate(seed: number): SachAufgabe {
  const zufall = erzeugeZufall(seed, "sachaufgaben");
  return zufall.wahl(["gleichung", "dreisatz"]) === "gleichung" ? aufgabeGleichung(zufall) : aufgabeDreisatz(zufall);
}

export const MELDUNGEN = {
  gleichungFalsch: "Die Gleichung passt nicht. Überlege: Ist das Gesuchte das Ganze, der Teil oder der Prozentsatz?",
  ergebnisFalsch: "Die Gleichung stimmt, aber das Ergebnis noch nicht. Rechne noch einmal nach.",
  falsch: "Das stimmt noch nicht. Prüfe jede Zeile: durch 100 teilen, dann mal p nehmen.",
};

/** Was an einer falschen Antwort falsch ist. */
export function grund(aufgabe: SachAufgabe, antwort: unknown): string {
  return grundFuer(
    aufgabe,
    antwort,
    (antworten: Antworten) => {
      if (aufgabe.typ === "dreisatz") return undefined;
      const [gleichung] = aufgabe.felder;
      if (gleichung === undefined) return undefined;
      return urteil(gleichung, antworten["gleichung"]).status === "richtig"
        ? MELDUNGEN.ergebnisFalsch
        : MELDUNGEN.gleichungFalsch;
    },
    MELDUNGEN.falsch,
  );
}

/** Die Meldung der App zu einer falschen Antwort (Vertrag der Übung): grund. */
export const reason = (aufgabe: SachAufgabe, antwort: unknown, _props?: unknown, _lang?: string): string =>
  grund(aufgabe, antwort);

/**
 * Die Antwort jedes typischen Fehlers aus about.mistakes: die erste falsche Gleichung mit ihrem Ergebnis; ein falsches
 * Ergebnis zur richtigen Gleichung hat viele Antworten; im Dreisatz mal 100 statt durch 100.
 */
export const mistakes = (aufgabe: SachAufgabe, _props?: unknown): (Antworten | undefined)[] =>
  nurFalsche(
    aufgabe,
    aufgabe.typ === "gleichung" ? [aufgabe.fehlweg, undefined, undefined] : [undefined, undefined, aufgabe.fehlweg],
  );

/** Die Fassungen des Textes: je Kontext und Gesuchtem eine Gleichungsaufgabe, je Kontext eine Dreisatz-Aufgabe. */
export function fassungen(): Record<string, string> {
  const liste: [string, string][] = [];
  for (const k of KONTEXTE) {
    const texte = TEXTE[k.id];
    if (texte === undefined) continue;
    for (const gesucht of ["W", "G", "p"] as const) {
      const rollen = GEGEBEN[gesucht];
      const platz = (rolle: Gesucht) =>
        platzhalter(rollen.indexOf(rolle) === 0 ? "Zahl1" : "Zahl2", rolle === "p" ? "%" : k.einheit);
      liste.push([`${k.id}-${gesucht}`, texte[gesucht](platz("G"), platz("W"), platz("p"))]);
    }
  }
  for (const k of KONTEXTE.filter((x) => ["preis", "umfrage", "akku"].includes(x.id))) {
    liste.push([`dreisatz-${k.id}`, dreisatzText(k.id, platzhalter("Zahl1", k.einheit), platzhalter("Zahl2", "%"))]);
  }
  return Object.fromEntries(liste);
}

/** Die Aufgabe, wie das Kind sie liest, mit {Fassung}, {Zahl1} und {Zahl2}. */
export const template = (_props?: unknown, _lang?: string): string =>
  vorlage(
    fassungen(),
    "Bei einer Gleichungsaufgabe wählt das Kind aus drei Gleichungen (eine passt, zwei verwechseln die Formeln) und tippt das Ergebnis; bei einer Dreisatz-Aufgabe tippt es 1 % und p %.",
  );

/** Was eine Aufgabe festlegt: die Fassung des Textes und die beiden Zahlen darin. */
export const params = (aufgabe: SachAufgabe, _props?: unknown, _lang?: string): Record<string, string> => ({
  Fassung: aufgabe.fassung,
  Zahl1: aufgabe.zahlen[0],
  Zahl2: aufgabe.zahlen[1],
});

/** Eine Antwort als Text, wie das Kind sie beschreibt. */
export const show = (antwort: unknown, aufgabe: SachAufgabe, _props?: unknown, _lang?: string): string =>
  zeige(aufgabe, antwort);

/** Die typische falsche Antwort: eine verwechselte Formel; im Dreisatz mal 100 statt durch 100. */
export function wrong(aufgabe: SachAufgabe): Antworten {
  const richtig = solution(aufgabe);
  const [erstes] = aufgabe.felder;
  if (aufgabe.typ === "gleichung" && erstes?.typ === "knoepfe") {
    const falsch = erstes.optionen.find((o) => o.wert !== erstes.loesung)?.wert ?? "";
    return { ...richtig, gleichung: falsch };
  }
  // 1 % ist der Grundwert mal 100 statt geteilt durch 100
  const eins = aufgabe.felder.find((feld) => feld.id === "eins");
  return { ...richtig, eins: eins?.typ === "zahl" ? eingabeFuer(zahl(eins.exakt) * 10000) : "0" };
}

export function describe(aufgabe: SachAufgabe): { task: string; solution: string } {
  return beschreibe(aufgabe);
}

export const about = {
  task: "Eine Sachaufgabe zur Prozentrechnung, Aufgabe für Aufgabe einer von zwei Typen: Gleichung (aus drei Gleichungen die passende wählen und das Ergebnis ausrechnen) oder Dreisatz (zum Grundwert erst 1 %, dann p % ausrechnen). Das Bild zur Aufgabe ist ein Hunderterfeld.",
  answer:
    "Gleichung: eine der drei Gleichungen (Knöpfe) und eine Zahl. Dreisatz: zwei Zahlen (1 % und p %) in der Einheit des Grundwerts. Dann „Prüfen“ unter der Aufgabe. Komma oder Punkt, ein Bruch oder ein Term gehen auch.",
  correct:
    "Richtig, wenn jede Angabe stimmt: die Gleichung, deren linke Seite das Gesuchte ist, und das exakte oder richtig gerundete Ergebnis; im Dreisatz 1 % = G / 100 und p % = G / 100 · p.",
  mistakes: [MELDUNGEN.gleichungFalsch, MELDUNGEN.ergebnisFalsch, MELDUNGEN.falsch],
};
