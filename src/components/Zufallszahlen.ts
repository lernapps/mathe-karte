// Der Zufall der Aufgaben aller Kapitel: mulberry32 aus einem 32-Bit-Startwert, dieselbe Folge für denselben Wert.
// Jedes Kapitel mischt die Aufgabennummer auf seine Art zum Startwert (sonst änderten sich die Aufgaben hinter den
// Nummern); die Folge selbst und die Auswahl daraus stehen nur hier (DRY, ADR-033). Rein, ohne DOM.

export interface Zufall {
  ganzzahl(min: number, max: number): number;
  wahl<T>(liste: readonly T[]): T;
  mischen<T>(liste: readonly T[]): T[];
}

/** Die Folge von mulberry32 ab dem Startwert `start` (32 Bit): Zahlen in [0, 1). */
export function mulberry32(start: number): () => number {
  let a = start >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ganzzahl, Wahl und Mischen aus einer Folge von Zahlen in [0, 1). */
export function zufallAusFolge(naechste: () => number): Zufall {
  return {
    ganzzahl: (min, max) => min + Math.floor(naechste() * (max - min + 1)),
    wahl<T>(liste: readonly T[]): T {
      const wert = liste[Math.floor(naechste() * liste.length)];
      if (wert === undefined) throw new RangeError("Wahl aus einer leeren Liste");
      return wert;
    },
    mischen<T>(liste: readonly T[]): T[] {
      const kopie = [...liste];
      for (let i = kopie.length - 1; i > 0; i--) {
        const j = Math.floor(naechste() * (i + 1));
        [kopie[i], kopie[j]] = [kopie[j] as T, kopie[i] as T];
      }
      return kopie;
    },
  };
}
