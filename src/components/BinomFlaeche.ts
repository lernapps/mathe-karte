// Flächenbilder der binomischen Formeln als Daten: Rechtecke, Texte und Linien, die BinomSvg.vue zeichnet. Reine
// Funktionen; aus flaechen.js der alten Lern-App übernommen.
// - raster: Rechteck aus Zeilen × Spalten (Klammer mal Klammer, 1. Formel, Rückwärts, Kopfrechnen)
// - produkt: raster für zwei Klammern mit Gliedern
// - quadratMinus: Quadrat a², zwei Streifen a·b weg, b² zurück (2. Formel)
// - umlegen: a² − b² als Winkel, umgelegt zum Rechteck (a + b)(a − b) (3. Formel)
import { betrag, gliedAnzeige, hatVariable, produkt, type Glied, type Polynom } from "./BinomTerm.ts";

/** Die Art einer Teilfläche, sie bestimmt die Farbe: a² blau, ab gelb, b² grün, abgezogen rot, leer weiß, Lücke ohne Füllung. */
export type Flaeche = "a" | "ab" | "b" | "minus" | "leer" | "luecke";
/** Die Farbe eines Texts: normal und leise wie der Seitentext, innen dunkel auf hellen Flächen, minus rot, plus grün. */
export type Ton = "normal" | "leise" | "innen" | "minus" | "plus";

/**
 * Eine Form des Bilds, ein Typ für alle Arten (so kann BinomSvg.vue ihn als Prop nehmen): ein Rechteck (x, y, w, h,
 * flaeche, gestrichelt), ein Text (x, y, text, groesse, anker, ton, fett) oder eine Linie von (x, y) nach (x + w, y + h).
 * Was die Art nicht braucht, bleibt auf dem Standardwert.
 */
export interface Form {
  art: "rect" | "text" | "line";
  x: number;
  y: number;
  w: number;
  h: number;
  flaeche: Flaeche;
  gestrichelt: boolean;
  text: string;
  groesse: number;
  anker: "start" | "middle" | "end";
  ton: Ton;
  fett: boolean;
}

const LEER: Form = {
  art: "rect",
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  flaeche: "leer",
  gestrichelt: false,
  text: "",
  groesse: 14,
  anker: "middle",
  ton: "normal",
  fett: false,
};

export interface Zeichnung {
  breite: number;
  hoehe: number;
  /** Was das Bild zeigt, für Screenreader. */
  label: string;
  formen: Form[];
}

/** Eine Seite des Bilds: ihr Text und ihre gedachte Länge. */
export interface Seite {
  text: string;
  laenge: number;
}

const X_LAENGE = 8; // gedachte Länge einer Variablen im Bild, damit x-Streifen breiter sind als kleine Zahlen
const r = (n: number): number => Math.round(n * 10) / 10;

/** Die gedachte Länge eines Glieds: 3x ist 24, 5 ist 5. */
export const laengeVon = (g: Glied): number => Math.abs(g.k) * (hatVariable(g) ? X_LAENGE : 1);
export const seiteVon = (g: Glied, text = gliedAnzeige(g)): Seite => ({ text, laenge: laengeVon(g) });

/** Teilt `gesamt` im Verhältnis der Längen; bei zwei Teilen keiner unter `min`, damit kleine Zahlen sichtbar bleiben. */
export function teile(laengen: number[], gesamt: number, min = 0.18): number[] {
  const summe = laengen.reduce((s, l) => s + Math.abs(l), 0) || 1;
  let anteile = laengen.map((l) => Math.abs(l) / summe);
  const [erster] = anteile;
  if (anteile.length === 2 && erster !== undefined) {
    const e = Math.min(1 - min, Math.max(min, erster));
    anteile = [e, 1 - e];
  }
  return anteile.map((a) => a * gesamt);
}

class Leinwand {
  readonly formen: Form[] = [];
  text(
    x: number,
    y: number,
    text: string,
    art: { groesse?: number; anker?: "start" | "middle" | "end"; ton?: Ton; fett?: boolean } = {},
  ): void {
    this.formen.push({
      ...LEER,
      art: "text",
      x: r(x),
      y: r(y),
      text,
      groesse: art.groesse ?? 14,
      anker: art.anker ?? "middle",
      ton: art.ton ?? "normal",
      fett: art.fett ?? false,
    });
  }
  rect(x: number, y: number, w: number, h: number, flaeche: Flaeche, gestrichelt = false): void {
    this.formen.push({ ...LEER, x: r(x), y: r(y), w: r(w), h: r(h), flaeche, gestrichelt });
  }
  linie(x1: number, y1: number, x2: number, y2: number): void {
    this.formen.push({ ...LEER, art: "line", x: r(x1), y: r(y1), w: r(x2 - x1), h: r(y2 - y1) });
  }
  unterschriften(y: number, titel: string, untertitel: string): void {
    this.text(160, y, titel, { groesse: 16, fett: true });
    if (untertitel) this.text(160, y + 20, untertitel, { groesse: 12, ton: "leise" });
  }
  zeichnung(hoehe: number, titel: string, untertitel: string): Zeichnung {
    return { breite: 320, hoehe: Math.round(hoehe), label: `${titel}. ${untertitel}`.trim(), formen: this.formen };
  }
}

export interface Zelle {
  text: string;
  flaeche: Flaeche;
}

/** Rechteck aus Zeilen × Spalten; zellen[zeile][spalte]. Die Längen bestimmen die Aufteilung, die Texte stehen außen und in den Feldern. */
export function raster(
  spalten: Seite[],
  zeilen: Seite[],
  zellen: Zelle[][],
  titel: string,
  untertitel = "",
): Zeichnung {
  const x0 = 64;
  const y0 = 30;
  const breiten = teile(
    spalten.map((s) => s.laenge),
    220,
  );
  const hoehen = teile(
    zeilen.map((z) => z.laenge),
    190,
  );
  const l = new Leinwand();
  let y = y0;
  zeilen.forEach((zeile, i) => {
    const h = hoehen[i] ?? 0;
    let x = x0;
    spalten.forEach((_, j) => {
      const w = breiten[j] ?? 0;
      const zelle = zellen[i]?.[j] ?? { text: "", flaeche: "leer" };
      l.rect(x, y, w, h, zelle.flaeche);
      l.text(x + w / 2, y + h / 2 + 5, zelle.text, { groesse: Math.min(w, h) < 40 ? 11 : 15, ton: "innen" });
      x += w;
    });
    l.text(x0 - 8, y + h / 2 + 5, zeile.text, { anker: "end", fett: true });
    y += h;
  });
  let x = x0;
  spalten.forEach((spalte, j) => {
    const w = breiten[j] ?? 0;
    l.text(x + w / 2, y0 - 10, spalte.text, { fett: true });
    x += w;
  });
  l.unterschriften(y0 + 190 + 32, titel, untertitel);
  return l.zeichnung(290, titel, untertitel);
}

/**
 * Klammer mal Klammer als Rechteck: Zeilen = Glieder von p, Spalten = Glieder von q. Vor der Lösung stehen in den
 * Feldern die Produkte ("2x · 4"), danach die Ergebnisse ("8x"). Felder mit Minus sind rot (werden abgezogen).
 */
export function produktBild(p: Polynom, q: Polynom, geloest: boolean, titel: string, untertitel: string): Zeichnung {
  const zellen = p.map((g, i) =>
    q.map((h, j): Zelle => {
      const pr = produkt(g, h);
      const minus = pr.k < 0;
      const flaeche: Flaeche = minus ? "minus" : i === 0 && j === 0 ? "a" : i === 1 && j === 1 ? "b" : "ab";
      const rechnung = `${minus ? "−" : ""}${gliedAnzeige(betrag(g))} · ${gliedAnzeige(betrag(h))}`;
      return { flaeche, text: geloest ? gliedAnzeige(pr) : rechnung };
    }),
  );
  return raster(
    q.map((h) => seiteVon(h)),
    p.map((g) => seiteVon(g)),
    zellen,
    titel,
    untertitel,
  );
}

/**
 * 2. Formel: Quadrat mit Seite a; rechts und unten je ein Streifen a·b (wird abgezogen), die Ecke b² ist dabei
 * doppelt weg und kommt einmal zurück. texte: rest (das übrige Quadrat), restSeite (a − b), streifen, ecke.
 */
export function quadratMinus(
  a: Seite,
  b: Seite,
  texte: { rest: string; restSeite: string; streifen: string; ecke: string },
  titel: string,
  untertitel: string,
): Zeichnung {
  const x0 = 72;
  const y0 = 34;
  const seite = 166;
  const bw = Math.max(26, Math.min(seite * 0.45, (seite * b.laenge) / a.laenge));
  const l = new Leinwand();
  l.rect(x0, y0, seite - bw, seite - bw, "a");
  l.text(x0 + (seite - bw) / 2, y0 + (seite - bw) / 2 + 5, texte.rest, { fett: true, ton: "innen" });
  l.rect(x0 + seite - bw, y0, bw, seite, "minus");
  l.rect(x0, y0 + seite - bw, seite, bw, "minus");
  l.rect(x0 + seite - bw, y0 + seite - bw, bw, bw, "b", true);
  l.text(x0 + seite - bw / 2, y0 + seite - bw / 2 + 5, texte.ecke, {
    groesse: bw < 40 ? 12 : 16,
    fett: true,
    ton: "innen",
  });
  l.text(x0 + seite + 6, y0 + (seite - bw) / 2, `− ${texte.streifen}`, { anker: "start", ton: "minus", fett: true });
  l.text(x0 + (seite - bw) / 2, y0 + seite + 18, `− ${texte.streifen}`, { ton: "minus", fett: true });
  l.text(x0 + seite + 6, y0 + seite - bw / 2 + 5, `+ ${texte.ecke}`, { anker: "start", ton: "plus", fett: true });
  l.linie(x0, y0 - 14, x0 + seite, y0 - 14);
  l.text(x0 + seite / 2, y0 - 19, a.text, { fett: true });
  l.text(x0 - 8, y0 + (seite - bw) / 2 + 5, texte.restSeite, { anker: "end", fett: true });
  l.text(x0 - 8, y0 + seite - bw / 2 + 5, b.text, { anker: "end", fett: true });
  l.unterschriften(y0 + seite + 46, titel, untertitel);
  return l.zeichnung(290, titel, untertitel);
}

/**
 * 3. Formel: oben das Quadrat a² ohne die Ecke b² (Winkel aus zwei Teilen), unten dieselben Teile umgelegt zum
 * Rechteck (a + b) × (a − b). texte: oben, unten (Unterschriften der beiden Bilder), rest (a − b), ecke.
 */
export function umlegen(
  a: Seite,
  b: Seite,
  texte: { oben: string; unten: string; rest: string; ecke: string },
  titel: string,
  untertitel: string,
): Zeichnung {
  const s = 130 / a.laenge;
  const bl = Math.max(18, Math.min(a.laenge * s * 0.45, b.laenge * s));
  const al = a.laenge * s;
  const rest = al - bl;
  const l = new Leinwand();
  const xo = (320 - al) / 2;
  const yo = 26;
  l.rect(xo, yo, al, rest, "a");
  l.rect(xo, yo + rest, rest, bl, "ab");
  l.rect(xo + rest, yo + rest, bl, bl, "luecke", true);
  l.text(xo + al + 6, yo + rest + bl / 2 + 5, texte.ecke, { anker: "start", ton: "minus", fett: true });
  l.text(xo + al / 2, yo - 8, a.text, { fett: true });
  l.text(xo - 6, yo + rest / 2 + 5, texte.rest, { anker: "end", fett: true });
  l.text(xo - 6, yo + rest + bl / 2 + 5, b.text, { anker: "end", fett: true });
  l.text(xo + rest / 2, yo + al + 18, texte.rest, { fett: true });
  l.text(160, yo + al + 42, texte.oben, { groesse: 13, ton: "leise" });
  const xu = Math.max(76, (320 - al - bl) / 2);
  const yu = yo + al + 84;
  l.rect(xu, yu, al, rest, "a");
  l.rect(xu + al, yu, bl, rest, "ab");
  l.text(xu + al / 2, yu - 8, a.text, { fett: true });
  l.text(xu + al + bl / 2, yu - 8, b.text, { fett: true });
  l.text(xu - 6, yu + rest / 2 + 5, texte.rest, { anker: "end", fett: true });
  l.text(160, yu + rest + 22, texte.unten, { groesse: 13, ton: "leise" });
  l.unterschriften(yu + rest + 50, titel, untertitel);
  return l.zeichnung(yo + al + 84 + rest + 78, titel, untertitel);
}
