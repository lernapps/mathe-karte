// Übung „Grundbegriffe erkennen“: in einer Textaufgabe jeder Zahl und dem Gesuchten ihre Rolle zuordnen (Grundwert,
// Prozentwert, Prozentsatz), in drei Kontexten (Fahrrad, Klasse, Umfrage). Portiert aus aufgaben/grundbegriffe.js.
import {
  type Antworten,
  type Aufgabe,
  type Feld,
  type KontextId,
  KONTEXTE,
  RABATTE,
  alsAntworten,
  bildWert,
  beschreibe,
  check,
  erzeugeTripel,
  grundFuer,
  platzhalter,
  solution,
  tabellenWert,
  vorlage,
  waehleKontext,
} from "./ProzentAufgabe.ts";
import { erzeugeZufall, formatZahl, mitEinheit } from "./ProzentKern.ts";

export { check, solution };

type Rolle = "G" | "W" | "p";
export const ROLLEN = [
  { wert: "G", text: "Grundwert G (das Ganze, 100 %)" },
  { wert: "W", text: "Prozentwert W (der Teil)" },
  { wert: "p", text: "Prozentsatz p % (der Anteil in Prozent)" },
];

interface Vorlage {
  text: string;
  gegeben: [[string, Rolle], [string, Rolle]];
  gesucht: string;
}
type Vorlagen = Record<Rolle, (g: string, w: string, p: string) => Vorlage>;

const VORLAGEN: Partial<Record<KontextId, Vorlagen>> = {
  preis: {
    W: (g, _w, p) => ({
      text: `Ein Fahrrad kostet ${g}. Im Angebot gibt es ${p} Rabatt. Wie viel Euro sparst du?`,
      gegeben: [
        [g, "G"],
        [p, "p"],
      ],
      gesucht: "der Rabatt in Euro",
    }),
    p: (g, w) => ({
      text: `Ein Fahrrad kostet ${g}. Der Rabatt beträgt ${w}. Wie viel Prozent Rabatt sind das?`,
      gegeben: [
        [g, "G"],
        [w, "W"],
      ],
      gesucht: "der Rabatt in Prozent",
    }),
    G: (_g, w, p) => ({
      text: `Beim Kauf eines Fahrrads sparst du ${w}. Das sind ${p} Rabatt. Wie viel hat das Fahrrad vorher gekostet?`,
      gegeben: [
        [w, "W"],
        [p, "p"],
      ],
      gesucht: "der alte Preis",
    }),
  },
  klasse: {
    W: (g, _w, p) => ({
      text: `In einer Klasse sind ${g}. ${p} von ihnen fahren mit dem Rad. Wie viele Schüler sind das?`,
      gegeben: [
        [g, "G"],
        [p, "p"],
      ],
      gesucht: "die Zahl der Radfahrer",
    }),
    p: (g, w) => ({
      text: `In einer Klasse sind ${g}. ${w} davon fahren mit dem Rad. Wie viel Prozent der Klasse sind das?`,
      gegeben: [
        [g, "G"],
        [w, "W"],
      ],
      gesucht: "der Anteil der Radfahrer in Prozent",
    }),
    G: (_g, w, p) => ({
      text: `${w} einer Klasse fahren mit dem Rad. Das sind ${p} der Klasse. Wie viele Schüler hat die Klasse?`,
      gegeben: [
        [w, "W"],
        [p, "p"],
      ],
      gesucht: "die Größe der Klasse",
    }),
  },
  umfrage: {
    W: (g, _w, p) => ({
      text: `${g} wurden befragt. ${p} davon lesen täglich Nachrichten. Wie viele Personen sind das?`,
      gegeben: [
        [g, "G"],
        [p, "p"],
      ],
      gesucht: "die Zahl der Nachrichtenleser",
    }),
    p: (g, w) => ({
      text: `${g} wurden befragt. ${w} davon lesen täglich Nachrichten. Wie viel Prozent sind das?`,
      gegeben: [
        [g, "G"],
        [w, "W"],
      ],
      gesucht: "der Anteil in Prozent",
    }),
    G: (_g, w, p) => ({
      text: `${w} lesen täglich Nachrichten. Das sind ${p} aller Befragten. Wie viele Personen wurden befragt?`,
      gegeben: [
        [w, "W"],
        [p, "p"],
      ],
      gesucht: "die Zahl aller Befragten",
    }),
  },
};

const auswahl = (id: string, label: string, loesung: Rolle): Feld => ({
  typ: "auswahl",
  id,
  label,
  optionen: ROLLEN,
  loesung,
});
const name = (rolle: string): string => ROLLEN.find((r) => r.wert === rolle)?.text ?? rolle;

export interface GrundbegriffeAufgabe extends Aufgabe {
  kontext: KontextId;
  gesucht: Rolle;
  /** Die beiden Zahlen im Text, in ihrer Reihenfolge, ohne Einheit. */
  zahlen: [string, string];
}

export function generate(seed: number): GrundbegriffeAufgabe {
  const zufall = erzeugeZufall(seed, "grundbegriffe");
  const kontext = waehleKontext(zufall, ["preis", "klasse", "umfrage"], {
    preis: { min: 150, max: 1500, saetze: RABATTE },
  });
  const { grundwert, prozentsatz, prozentwert } = erzeugeTripel(zufall, kontext);
  const gesucht = zufall.wahl<Rolle>(["G", "W", "p"]);
  const einheit = kontext.einheit;
  const vorlagen = VORLAGEN[kontext.id] as Vorlagen;
  const v = vorlagen[gesucht](
    mitEinheit(grundwert, einheit),
    mitEinheit(prozentwert, einheit),
    mitEinheit(prozentsatz, "%"),
  );
  const [[zahl1, rolle1], [zahl2, rolle2]] = v.gegeben;
  const wert = { G: grundwert, W: prozentwert, p: prozentsatz };
  const ohneEinheit = (rolle: Rolle) => tabellenWert(wert[rolle], rolle === "p" ? "%" : einheit);
  const titel = `G = ${bildWert(grundwert, einheit)}, p = ${formatZahl(prozentsatz)} %`;
  return {
    kontext: kontext.id,
    gesucht,
    zahlen: [ohneEinheit(rolle1), ohneEinheit(rolle2)],
    text: v.text,
    felder: [
      auswahl("zahl1", `${zahl1} ist …`, rolle1),
      auswahl("zahl2", `${zahl2} ist …`, rolle2),
      auswahl("gesucht", `Gesucht: ${v.gesucht} ist …`, gesucht),
    ],
    bild: {
      art: "raster",
      gefuellt: prozentsatz,
      titel: "Das ganze Feld = Grundwert",
      untertitel: "blau = Prozentwert",
    },
    bildGeloest: { art: "raster", gefuellt: prozentsatz, titel, untertitel: `W = ${bildWert(prozentwert, einheit)}` },
    tipp: "Der Grundwert ist das Ganze, auf das sich die Prozente beziehen. Die Zahl mit dem %-Zeichen ist immer der Prozentsatz. Der Prozentwert ist der Teil – er hat dieselbe Einheit wie der Grundwert.",
    rechenweg: [
      `${zahl1} → ${name(rolle1)}`,
      `${zahl2} → ${name(rolle2)}`,
      `Gesucht (${v.gesucht}) → ${name(gesucht)}`,
    ],
    richtig: "Alle drei Größen erkannt.",
  };
}

export const MELDUNGEN = {
  vertauscht:
    "Grundwert und Prozentwert sind vertauscht. Der Grundwert ist das Ganze (100 %), der Prozentwert nur ein Teil davon.",
  falsch: "Noch nicht alles richtig. Frag dich bei jeder Zahl: Ist das das Ganze, der Teil oder der Anteil in Prozent?",
};

/** Was an einer falschen Zuordnung falsch ist, mit der Zahl der richtigen Felder. */
export function grund(aufgabe: GrundbegriffeAufgabe, antwort: unknown): string {
  const antworten = alsAntworten(antwort);
  const richtige = aufgabe.felder.filter((feld) => antworten[feld.id] === feld.loesung).length;
  const meldung = grundFuer(
    aufgabe,
    antworten,
    (a: Antworten) => {
      const g = aufgabe.felder.find((f) => f.loesung === "G");
      const w = aufgabe.felder.find((f) => f.loesung === "W");
      return g && w && a[g.id] === "W" && a[w.id] === "G" ? MELDUNGEN.vertauscht : undefined;
    },
    MELDUNGEN.falsch,
  );
  return `${meldung} (${richtige} von 3 richtig)`;
}

/** Die Meldung der App zu einer falschen Antwort (Vertrag der Übung): grund. */
export const reason = (aufgabe: GrundbegriffeAufgabe, antwort: unknown, _props?: unknown, _lang?: string): string =>
  grund(aufgabe, antwort);

/** Die Antwort jedes typischen Fehlers aus about.mistakes: G und W vertauscht; „noch nicht alles“ hat viele. */
export const mistakes = (aufgabe: GrundbegriffeAufgabe, _props?: unknown): (Antworten | undefined)[] => [
  wrong(aufgabe),
  undefined,
];

/** Die Fassungen des Textes, je Kontext und Gesuchtem („preis-W“), mit {Zahl1} und {Zahl2} in ihrer Reihenfolge. */
export function fassungen(): Record<string, string> {
  const liste: [string, string][] = [];
  for (const k of KONTEXTE) {
    const vorlagen = VORLAGEN[k.id];
    if (vorlagen === undefined) continue;
    for (const gesucht of ["G", "W", "p"] as const) {
      const rollen = vorlagen[gesucht]("", "", "").gegeben.map(([, rolle]) => rolle);
      const platz = (rolle: Rolle) =>
        platzhalter(rollen.indexOf(rolle) === 0 ? "Zahl1" : "Zahl2", rolle === "p" ? "%" : k.einheit);
      liste.push([`${k.id}-${gesucht}`, vorlagen[gesucht](platz("G"), platz("W"), platz("p")).text]);
    }
  }
  return Object.fromEntries(liste);
}

/** Die Aufgabe, wie das Kind sie liest, mit {Fassung}, {Zahl1} und {Zahl2}. */
export const template = (_props?: unknown, _lang?: string): string =>
  vorlage(
    fassungen(),
    "Das Kind wählt für die erste Zahl ({Zahl1}), die zweite ({Zahl2}) und das Gesuchte je eine Rolle: Grundwert G, Prozentwert W oder Prozentsatz p %.",
  );

/** Was eine Aufgabe festlegt: die Fassung des Textes und die beiden Zahlen. */
export const params = (aufgabe: GrundbegriffeAufgabe, _props?: unknown, _lang?: string): Record<string, string> => ({
  Fassung: `${aufgabe.kontext}-${aufgabe.gesucht}`,
  Zahl1: aufgabe.zahlen[0],
  Zahl2: aufgabe.zahlen[1],
});

/** Eine Antwort als Text, knapp: jede Zahl und das Gesuchte mit der gewählten Rolle (G, W oder p), „?“ für keine. */
export function show(antwort: unknown, aufgabe: GrundbegriffeAufgabe, _props?: unknown, _lang?: string): string {
  const antworten = alsAntworten(antwort);
  const rolle = (id: string) => antworten[id] || "?";
  const [zahl1 = "", zahl2 = ""] = aufgabe.felder.map((feld) => feld.label.replace(/ ist …$/, ""));
  return `${zahl1}: ${rolle("zahl1")}; ${zahl2}: ${rolle("zahl2")}; gesucht: ${rolle("gesucht")}`;
}

/** Die typische falsche Antwort: Grundwert und Prozentwert vertauscht. */
export function wrong(aufgabe: GrundbegriffeAufgabe): Antworten {
  const tausch: Record<string, string> = { G: "W", W: "G", p: "p" };
  return Object.fromEntries(aufgabe.felder.map((feld) => [feld.id, tausch[feld.loesung] ?? feld.loesung]));
}

export function describe(aufgabe: GrundbegriffeAufgabe): { task: string; solution: string } {
  return beschreibe(aufgabe);
}

export const about = {
  task: "Eine Textaufgabe mit zwei Zahlen und einer Frage. Zu jeder Zahl und zum Gesuchten wählt man aus einer Liste, ob es der Grundwert, der Prozentwert oder der Prozentsatz ist. Gerechnet wird nicht.",
  answer:
    "Drei Auswahlen aus Grundwert G, Prozentwert W und Prozentsatz p %, je in einer Liste; dann „Prüfen“ unter der Aufgabe.",
  correct:
    "Richtig, wenn alle drei Rollen stimmen: die Zahl mit % ist der Prozentsatz, das Ganze (100 %) der Grundwert, der Teil in derselben Einheit der Prozentwert.",
  mistakes: [MELDUNGEN.vertauscht, MELDUNGEN.falsch],
};
