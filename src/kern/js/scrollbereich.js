/* Waagerecht scrollende Bereiche (breite Tabellen, Bilder in natürlicher Größe) sind per Tastatur erreichbar, aber nur,
 * solange sie wirklich scrollen: dann tabindex="0", sonst kein zusätzlicher Tabstopp (axe scrollable-region-focusable).
 * Generisch: welche Bereiche scrollen können, sagt das CSS (overflow-x: auto). */

/** Die Bereiche, die im CSS des Kerns oder einer App waagerecht scrollen dürfen. */
export const SCROLLBEREICHE = ".tabelle-rahmen, #visualisierung, .aufgabe-bild, .test-bild";

/**
 * Setzt tabindex="0", solange der Bereich breiter ist als sein Platz, und nimmt ihn wieder weg, wenn nicht. Ein
 * anderer tabindex (von der Seite gesetzt) bleibt.
 * @param {Pick<Element, "scrollWidth" | "clientWidth" | "getAttribute" | "setAttribute" | "removeAttribute">} bereich
 */
export function aktualisiereScrollbereich(bereich) {
  const jetzt = bereich.getAttribute("tabindex");
  if (jetzt !== null && jetzt !== "0") return;
  // Nur schreiben, was sich ändert: jede Änderung meldet der MutationObserver von initScrollbereiche.
  const scrollt = bereich.scrollWidth > bereich.clientWidth;
  if (scrollt && jetzt === null) bereich.setAttribute("tabindex", "0");
  else if (!scrollt && jetzt === "0") bereich.removeAttribute("tabindex");
}

/**
 * Beobachtet alle Scrollbereiche unter wurzel: beim Laden, wenn sich ihre Größe ändert und wenn ihr Inhalt neu
 * gezeichnet wird (eine neue Aufgabe zeichnet ein anderes Bild).
 * @param {ParentNode} [wurzel]
 */
export function initScrollbereiche(wurzel = document) {
  const bereiche = /** @type {HTMLElement[]} */ ([...wurzel.querySelectorAll(SCROLLBEREICHE)]);
  const alle = () => bereiche.forEach(aktualisiereScrollbereich);
  alle();
  if (typeof ResizeObserver !== "undefined") {
    const groesse = new ResizeObserver(alle);
    bereiche.forEach((b) => groesse.observe(b));
  }
  if (typeof MutationObserver !== "undefined") {
    const inhalt = new MutationObserver(alle);
    bereiche.forEach((b) => inhalt.observe(b, { childList: true, subtree: true, attributes: true }));
  }
}
