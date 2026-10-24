// Exakte Brüche für alle Kapitel: gekürzt, mit positivem Nenner, Rechnen ohne Gleitkomma und kaufmännisches Runden
// auf Nachkommastellen. Die eine Stelle für Bruchrechnung (DRY, ADR-033): Prozent, Binom und Zufall rechnen damit.
// Rein, ohne DOM.

/** Ein gekürzter Bruch mit positivem Nenner. */
export interface Bruch {
  z: number;
  n: number;
}

export function ggT(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

export function bruch(z: number, n = 1): Bruch {
  if (!Number.isInteger(z) || !Number.isInteger(n) || n === 0) throw new RangeError(`kein Bruch: ${z}/${n}`);
  const vorzeichen = n < 0 ? -1 : 1;
  const t = ggT(z, n) || 1;
  return { z: (vorzeichen * z) / t + 0, n: (vorzeichen * n) / t };
}

export const NULL: Bruch = { z: 0, n: 1 };
export const EINS: Bruch = { z: 1, n: 1 };

export const plus = (a: Bruch, b: Bruch): Bruch => bruch(a.z * b.n + b.z * a.n, a.n * b.n);
export const minus = (a: Bruch, b: Bruch): Bruch => bruch(a.z * b.n - b.z * a.n, a.n * b.n);
export const mal = (a: Bruch, b: Bruch): Bruch => bruch(a.z * b.z, a.n * b.n);
export const durch = (a: Bruch, b: Bruch): Bruch => bruch(a.z * b.n, a.n * b.z);
export const gleich = (a: Bruch, b: Bruch): boolean => a.z * b.n === b.z * a.n;
export const summe = (liste: readonly Bruch[]): Bruch => liste.reduce(plus, NULL);
export const produkt = (liste: readonly Bruch[]): Bruch => liste.reduce(mal, EINS);
export const zahl = (a: Bruch): number => a.z / a.n;

export function hoch(a: Bruch, e: number): Bruch {
  let r = EINS;
  for (let i = 0; i < e; i++) r = mal(r, a);
  return r;
}

/** „3/8“, eine ganze Zahl ohne Nenner. */
export const text = (a: Bruch): string => (a.n === 1 ? String(a.z) : `${a.z}/${a.n}`);

/** Der Bruch auf `stellen` Nachkommastellen gerundet (kaufmännisch), als Bruch mit Nenner 10^stellen. */
export function runde(a: Bruch, stellen: number): Bruch {
  const skala = 10 ** stellen;
  const betrag = Math.abs(a.z) * skala;
  const q = Math.floor(betrag / a.n);
  const gerundet = 2 * (betrag - q * a.n) >= a.n ? q + 1 : q;
  return bruch(a.z < 0 ? -gerundet : gerundet, skala);
}

/** Nach wie vielen Nachkommastellen der Bruch endet; Infinity, wenn er periodisch ist (1/3). */
export function endStellen(a: Bruch): number {
  let n = a.n;
  let zwei = 0;
  let fuenf = 0;
  while (n % 2 === 0) {
    n /= 2;
    zwei++;
  }
  while (n % 5 === 0) {
    n /= 5;
    fuenf++;
  }
  return n === 1 ? Math.max(zwei, fuenf) : Infinity;
}
