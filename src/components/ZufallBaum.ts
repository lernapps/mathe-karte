// Die Lage eines Baumdiagramms für ZufallBaum.vue, rein und ohne DOM: Wurzel oben, Zweige nach unten, alle Texte
// waagerecht. Die Blätter stehen nebeneinander in gleich breiten Spalten, zwischen Geschwistergruppen eine Lücke. Jeder
// Zweig endet senkrecht im Kind, sein Bruch sitzt dort auf der Linie (mit Rand in der Farbe des Hintergrunds). Ein
// fehlender Zweig zeigt „?“ und seinen Buchstaben auf der Mitte. Knoten sind Kreise mit Kürzel (R, B, G …); die Legende
// nennt die vollen Namen, so ist die Farbe nie das einzige Signal. Unter den Blättern stehen auf Wunsch die
// Pfadwahrscheinlichkeiten, bei Platzmangel abwechselnd in zwei Zeilen.
import { text } from "./ZufallBruch.ts";
import { type Baum, type Ergebnis, type Knoten, alleKnoten, blaetter, pfadName, zweigText } from "./ZufallModell.ts";

/** So breit darf der Baum höchstens werden, damit er auf einem 360-px-Handy ohne Verkleinern passt. */
export const MAX_BREITE = 320;
const R = 12;
const RAND = 4;
const OBEN = 22;
const STUFE = 72;
const ZEICHEN = 7.6;
const SPALTE_MIN = 30;
const SPALTE_MAX = 80;
const LUECKE_MAX = 12;
const LUECKE_MIN = 4;
const ZEILE = 15;

export interface BaumOptionen {
  /** Die Knoten (Pfade), deren Zweig fehlt; sie heißen der Reihe nach a, b, c, d. */
  versteckt?: readonly string[];
  /** Die fehlenden Zweige mit ihrem Wert zeigen. */
  geloest?: boolean;
  /** Die Pfade (Blätter), deren Zweige orange sind. */
  hervor?: readonly string[];
  /** Die Pfadwahrscheinlichkeiten unter den Blättern zeigen. */
  zeigePfad?: boolean;
}

export interface ZweigBild {
  id: string;
  d: string;
  lx: number;
  ly: number;
  text: string;
  betont: boolean;
  buchstabe: string;
  bx: number;
  by: number;
  titel: string;
}

export interface KnotenBild {
  id: string;
  x: number;
  y: number;
  kuerzel: string;
  farbe: string;
  schrift: string;
  name: string;
}

export interface BlattBild {
  id: string;
  x: number;
  py: number;
  pfadText: string;
  rx: number;
  ry: number;
  rw: number;
  rh: number;
  name: string;
}

export interface BaumBild {
  breite: number;
  hoehe: number;
  wx: number;
  wy: number;
  zweige: ZweigBild[];
  knoten: KnotenBild[];
  blaetter: BlattBild[];
  legende: string;
  legendeY: number;
}

export const BUCHSTABEN = ["a", "b", "c", "d"];

const breite = (t: string) => Math.ceil(t.length * ZEICHEN) + 4;

/** Schwarze oder weiße Schrift, je nachdem, was auf der Farbe besser lesbar ist. */
export function schriftFarbe(hex: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return "#1a1a1a";
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#1a1a1a" : "#ffffff";
}

/** Kürzel je Ergebnis: kurze Namen bleiben, sonst der Anfangsbuchstabe; bei gleichem Anfang zwei Buchstaben. */
export function kuerzelVon(ergebnisse: readonly Ergebnis[]): Map<string, string> {
  const gross = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const karte = new Map<string, string>();
  for (const e of ergebnisse) {
    const doppelt = ergebnisse.some((x) => x !== e && x.name.length > 2 && x.name.charAt(0) === e.name.charAt(0));
    karte.set(e.id, e.name.length <= 2 ? e.name : gross(e.name.slice(0, doppelt ? 2 : 1)));
  }
  return karte;
}

/** Die Legende: „R = rot · B = blau“; leer, wenn jedes Kürzel schon der Name ist. */
export function legendeVon(ergebnisse: readonly Ergebnis[]): string {
  const k = kuerzelVon(ergebnisse);
  return ergebnisse
    .filter((e) => k.get(e.id) !== e.name)
    .map((e) => `${k.get(e.id) ?? ""} = ${e.name}`)
    .join(" · ");
}

/** Liegt der Zweig zum Knoten `id` auf dem Pfad zum Blatt `blatt`? */
export const liegtAufPfad = (id: string, blatt: string): boolean => blatt.startsWith(id);

/** Die Lage aller Teile des Baums. */
export function baumBild(baum: Baum, o: BaumOptionen = {}): BaumBild {
  const liste = blaetter(baum);
  const n = Math.max(liste.length, 1);
  const gruppen = new Set(liste.map((b) => b.id.slice(0, -1))).size;
  const zweigMax = Math.max(SPALTE_MIN, ...liste.map((b) => breite(zweigText(b))));
  const pfadMax = o.zeigePfad === true ? Math.max(...liste.map((b) => breite(text(b.pw)))) : 0;
  const einzeilig = Math.max(zweigMax, pfadMax);
  const passt = 2 * RAND + n * einzeilig + (gruppen - 1) * LUECKE_MIN <= MAX_BREITE;
  const basis = passt ? einzeilig : Math.max(zweigMax, Math.ceil(pfadMax / 2) + 2);
  const spalte = Math.max(
    basis,
    Math.min(SPALTE_MAX, Math.floor((MAX_BREITE - 2 * RAND - (gruppen - 1) * LUECKE_MAX) / n)),
  );
  const versetzt = pfadMax > spalte;
  const rand = RAND + (versetzt ? Math.ceil((pfadMax - spalte) / 2) : 0);
  const frei = MAX_BREITE - 2 * rand - n * spalte;
  const luecke = gruppen > 1 ? Math.max(LUECKE_MIN, Math.min(LUECKE_MAX, Math.floor(frei / (gruppen - 1)))) : 0;
  const gesamtBreite = 2 * rand + n * spalte + (gruppen - 1) * luecke;

  const xVon = new Map<string, number>();
  let x = rand;
  let letzteGruppe: string | undefined;
  for (const b of liste) {
    const gruppe = b.id.slice(0, -1);
    if (letzteGruppe !== undefined && gruppe !== letzteGruppe) x += luecke;
    xVon.set(b.id, x + spalte / 2);
    x += spalte;
    letzteGruppe = gruppe;
  }
  const lege = (k: Knoten): number => {
    const vorhanden = xVon.get(k.id);
    if (vorhanden !== undefined) return vorhanden;
    const xs = k.kinder.map(lege);
    const mitte = xs.length > 0 ? (Math.min(...xs) + Math.max(...xs)) / 2 : gesamtBreite / 2;
    xVon.set(k.id, mitte);
    return mitte;
  };
  lege(baum.wurzel);
  const yVon = (stufe: number) => OBEN + stufe * STUFE;

  const kuerzel = kuerzelVon(baum.versuch.ergebnisse);
  const versteckt = o.versteckt ?? [];
  const hervor = o.hervor ?? [];
  const zweige: ZweigBild[] = [];
  const knoten: KnotenBild[] = [];
  for (const k of alleKnoten(baum)) {
    const elternId = k.id.slice(0, -1);
    const px = xVon.get(elternId) ?? 0;
    const py = yVon(k.stufe - 1) + (elternId === "" ? 6 : R);
    const cx = xVon.get(k.id) ?? 0;
    const cy = yVon(k.stufe);
    const mitte = (py + cy - R) / 2;
    const index = versteckt.indexOf(k.id);
    const buchstabe = index >= 0 ? (BUCHSTABEN[index] ?? "") : "";
    const zeigeWert = buchstabe === "" || o.geloest === true;
    zweige.push({
      id: k.id,
      d: `M${px} ${py} C ${px} ${mitte}, ${cx} ${mitte}, ${cx} ${cy - R}`,
      lx: cx,
      ly: cy - R - 6,
      text: zeigeWert ? zweigText(k) : "?",
      betont: hervor.some((b) => liegtAufPfad(k.id, b)),
      buchstabe,
      bx: cx,
      by: cy - R - 20,
      titel: zeigeWert ? `P(${k.name}) = ${zweigText(k)}` : `Zweig ${buchstabe}: fehlt`,
    });
    knoten.push({
      id: k.id,
      x: cx,
      y: cy,
      kuerzel: kuerzel.get(k.ergebnis) ?? k.name,
      farbe: k.farbe,
      schrift: schriftFarbe(k.farbe),
      name: k.name,
    });
  }
  let tiefste = yVon(baum.zuege) + R + 2;
  const blattBilder = liste.map((b, i): BlattBild => {
    const cx = xVon.get(b.id) ?? 0;
    const cy = yVon(b.stufe);
    const py = cy + R + ZEILE + (versetzt && i % 2 === 1 ? ZEILE : 0);
    const unten = o.zeigePfad === true ? py + 4 : cy + R + 2;
    tiefste = Math.max(tiefste, unten);
    return {
      id: b.id,
      x: cx,
      py,
      pfadText: o.zeigePfad === true ? text(b.pw) : "",
      rx: cx - spalte / 2 + 1,
      ry: cy - R - 2,
      rw: spalte - 2,
      rh: unten - (cy - R - 2),
      name: pfadName(baum, b.id),
    };
  });
  const legende = legendeVon(baum.versuch.ergebnisse);
  const legendeY = tiefste + 18;
  const hoehe = legende === "" ? tiefste + 4 : legendeY + 6;
  return {
    breite: Math.max(gesamtBreite, legende === "" ? 0 : breite(legende) + 2 * RAND),
    hoehe,
    wx: xVon.get("") ?? gesamtBreite / 2,
    wy: yVon(0),
    zweige,
    knoten,
    blaetter: blattBilder,
    legende,
    legendeY,
  };
}
