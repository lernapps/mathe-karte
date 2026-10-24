// Übung „Zwei Werte vergleichen“: Um wie viel Prozent ist A größer (teurer) oder kleiner (billiger) als B? Die
// Bezugsgröße steht nach „als“. Vier Kontexte (Läden, Punkte, Größe, Schulen), Balken für Bezugsgröße und
// Vergleichswert. Portiert aus aufgaben/vergleich.js der alten App.
import {
  type Antworten,
  type Aufgabe,
  PROZENTSAETZE,
  beschreibe,
  bildWert,
  check,
  eingabeFuer,
  grundFuer,
  solution,
  waehleGrundwert,
  zahlenfeld,
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
  minus,
  mitEinheit,
  passtZu,
  runde,
  zahl,
} from "./ProzentKern.ts";

export { check, solution };

type Frage = "groesser" | "kleiner";
interface Kontext {
  einheit: string;
  min: number;
  max: number;
  nachkomma: number;
  schritt: number;
  nameA: string;
  nameB: string;
  dingA: string;
  dingB: string;
  woerter?: Record<Frage, string>;
  frage?: (v: string, bezug: string, wort: string) => string;
}

const KONTEXTE: readonly Kontext[] = [
  // bei Preisen sagt man „teurer“ und „billiger“
  {
    einheit: "€",
    min: 20,
    max: 500,
    nachkomma: 1,
    schritt: 5,
    nameA: "Im Laden A kostet ein Rucksack",
    nameB: "im Laden B",
    dingA: "Laden A",
    dingB: "Laden B",
    woerter: { groesser: "teurer", kleiner: "billiger" },
    frage: (v, bezug, wort) => `Um wie viel Prozent ist der Rucksack in ${v} ${wort} als in ${bezug}?`,
  },
  {
    einheit: "Punkte",
    min: 20,
    max: 200,
    nachkomma: 0,
    schritt: 1,
    nameA: "Lena hat im ersten Spiel",
    nameB: "im zweiten Spiel",
    dingA: "das Ergebnis im ersten Spiel",
    dingB: "das Ergebnis im zweiten Spiel",
  },
  {
    einheit: "cm",
    min: 120,
    max: 200,
    nachkomma: 0,
    schritt: 1,
    nameA: "Ben ist",
    nameB: "seine Schwester Mia",
    dingA: "Ben",
    dingB: "Mia",
  },
  {
    einheit: "Schüler",
    min: 200,
    max: 1000,
    nachkomma: 0,
    schritt: 10,
    nameA: "Die Schule am See hat",
    nameB: "die Stadtschule",
    dingA: "die Schule am See",
    dingB: "die Stadtschule",
  },
];
const SAETZE = PROZENTSAETZE.filter((p) => p <= 60);

export interface VergleichAufgabe extends Aufgabe {
  bezug: number;
  vergleich: number;
}

export function generate(seed: number): VergleichAufgabe {
  const zufall = erzeugeZufall(seed, "vergleich");
  const frage = zufall.wahl<Frage>(["groesser", "kleiner"]);
  const k = zufall.wahl(KONTEXTE);
  // beide Werte bleiben im Bereich des Kontexts; Rückfall: 10 % vom Rand liegt immer darin
  let bezug = frage === "groesser" ? k.min : k.max;
  let anderer = runde(frage === "groesser" ? bezug * 1.1 : bezug * 0.9, k.nachkomma);
  for (let versuch = 0; versuch < 50; versuch++) {
    const p = zufall.wahl(SAETZE);
    const basis = waehleGrundwert(zufall, p, k) ?? k.min;
    const x = runde(frage === "groesser" ? basis * (1 + p / 100) : basis * (1 - p / 100), k.nachkomma);
    if (x >= k.min && x <= k.max) {
      [bezug, anderer] = [basis, x];
      break;
    }
  }
  const [a, b] = zufall.wahl([
    [bezug, anderer],
    [anderer, bezug],
  ] as const);
  const vergleich = anderer;
  const einheit = k.einheit;
  const gross = Math.max(a, b);
  const klein = Math.min(a, b);
  const unterschied = minus(alsBruch(gross), alsBruch(klein));
  const exakt = mal(durch(unterschied, alsBruch(bezug)), bruch(100));
  const prozentsatz = runde(zahl(exakt), 2);
  const andererSatz = runde(((gross - klein) / vergleich) * 100, 1);
  const [dingV, dingBezug] = vergleich === a ? [k.dingA, k.dingB] : [k.dingB, k.dingA];
  const wort = k.woerter?.[frage] ?? (frage === "groesser" ? "größer" : "kleiner");
  const text = `${k.nameA} ${mitEinheit(a, einheit)}, ${k.nameB} ${mitEinheit(b, einheit)}. ${
    k.frage ? k.frage(dingV, dingBezug, wort) : `Um wie viel Prozent ist ${dingV} ${wort} als ${dingBezug}?`
  }`;
  const zeichen = gleichheitszeichen(zahl(exakt), prozentsatz);
  const etwa = gleichheitszeichen(((gross - klein) / vergleich) * 100, andererSatz) === "=" ? "" : "etwa ";
  const d = formatWert(gross - klein, einheit);
  const richtung = frage === "groesser" ? "mehr" : "weniger";
  const balken = (geloest: boolean) => ({
    art: "balken" as const,
    titel: `Um wie viel Prozent ${wort}?`,
    balken: [
      { wert: bezug, grau: true, text: `Bezugsgröße (100 %): ${bildWert(bezug, einheit)}` },
      {
        wert: vergleich,
        grau: false,
        text: `Vergleichswert ${bildWert(vergleich, einheit)} – ${geloest ? formatZahl(prozentsatz) : "?"} % ${richtung}`,
      },
    ],
  });
  return {
    bezug,
    vergleich,
    text,
    felder: [zahlenfeld("prozentsatz", `Um wie viel Prozent ${wort}?`, "%", "prozent", exakt)],
    bild: balken(false),
    bildGeloest: balken(true),
    tipp: `Die Bezugsgröße steht nach dem Wort „als“: ${dingBezug} = ${mitEinheit(bezug, einheit)} sind 100 %. Teile den Unterschied (${mitEinheit(gross - klein, einheit)}) durch die Bezugsgröße, nicht durch den anderen Wert – sonst kommt ${etwa}${formatZahl(andererSatz)} % heraus, und das wäre die Antwort auf die andere Frage.`,
    rechenweg: [
      `Unterschied: ${formatWert(gross, einheit)} − ${formatWert(klein, einheit)} = ${d}`,
      `Bezugsgröße (steht nach „als“): ${mitEinheit(bezug, einheit)} = 100 %`,
      `p = ${d} / ${formatWert(bezug, einheit)} · 100 ${zeichen} ${formatZahl(prozentsatz)}`,
      `p % ${zeichen} ${formatZahl(prozentsatz)} %`,
    ],
    richtig: `Ergebnis: ${formatZahl(prozentsatz)} % ${wort}.`,
  };
}

export const MELDUNGEN = {
  bezugVerwechselt: "Das ist die Antwort auf die andere Frage. Die Bezugsgröße (100 %) ist die Zahl nach „als“.",
  differenzStattProzent:
    "Das ist nur der Unterschied in der Einheit. Gefragt ist der Unterschied in Prozent der Bezugsgröße.",
  verhaeltnisStattUnterschied:
    "Das ist das Verhältnis der beiden Werte in Prozent. Gefragt ist, um wie viel Prozent mehr oder weniger – also die 100 % abziehen.",
  falsch: "Das stimmt noch nicht. Rechne: Unterschied geteilt durch die Bezugsgröße, dann mal 100.",
};

const unterschiedVon = (a: VergleichAufgabe) =>
  minus(alsBruch(Math.max(a.bezug, a.vergleich)), alsBruch(Math.min(a.bezug, a.vergleich)));

/** Was an einer falschen Antwort falsch ist. */
export function grund(aufgabe: VergleichAufgabe, antwort: unknown): string {
  const [feld] = aufgabe.felder;
  if (feld?.typ !== "zahl") return MELDUNGEN.falsch;
  return grundFuer(
    aufgabe,
    antwort,
    (antworten: Antworten) => {
      const eingabe = antworten["prozentsatz"];
      const u = unterschiedVon(aufgabe);
      if (passtZu(eingabe, mal(durch(u, alsBruch(aufgabe.vergleich)), bruch(100)), feld.art))
        return MELDUNGEN.bezugVerwechselt;
      if (passtZu(eingabe, u, feld.art)) return MELDUNGEN.differenzStattProzent;
      if (passtZu(eingabe, mal(durch(alsBruch(aufgabe.vergleich), alsBruch(aufgabe.bezug)), bruch(100)), feld.art))
        return MELDUNGEN.verhaeltnisStattUnterschied;
      return undefined;
    },
    MELDUNGEN.falsch,
  );
}

/** Die typische falsche Antwort: durch den anderen Wert geteilt. */
export function wrong(aufgabe: VergleichAufgabe): Antworten {
  return { prozentsatz: eingabeFuer((zahl(unterschiedVon(aufgabe)) / aufgabe.vergleich) * 100) };
}

export function describe(aufgabe: VergleichAufgabe): { task: string; solution: string } {
  return beschreibe(aufgabe);
}

export const about = {
  task: "Zwei Werte (Preise, Punkte, Größen, Schülerzahlen) und die Frage, um wie viel Prozent der eine größer oder kleiner ist als der andere. Das Bild zur Aufgabe zeigt Bezugsgröße und Vergleichswert als Balken.",
  answer: "Der Prozentsatz als Zahl in Prozent; Komma oder Punkt, ein Bruch oder ein Term gehen auch.",
  correct:
    "p = Unterschied / Bezugsgröße · 100, die Bezugsgröße ist der Wert nach „als“; exakt oder kaufmännisch gerundet auf mindestens eine Nachkommastelle.",
  mistakes: [MELDUNGEN.bezugVerwechselt, MELDUNGEN.differenzStattProzent, MELDUNGEN.verhaeltnisStattUnterschied],
};
