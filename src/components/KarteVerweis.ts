// Der Verweis einer Seite auf ihren Knoten in der Lehrplan-Karte (karte/, öffentlicher URL-Parameter knoten). Jede
// Seite liegt unter /<kapitel>/<seite>/, die Karte unter /karte/: der Weg ist darum immer derselbe, relativ, und
// funktioniert unter jeder Adresse, auch in der Kopie auf lernapps.net.

/** Die relative Adresse der Karte mit dem Knoten, von einer Seite /<kapitel>/<seite>/ aus. */
export function karteAdresse(knoten: string): string {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(knoten)) throw new Error(`kein Knoten der Karte: "${knoten}"`);
  return `../../karte/?knoten=${knoten}`;
}
