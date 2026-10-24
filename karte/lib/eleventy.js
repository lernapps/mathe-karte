/*
 * Einbindung der Mathe-Karte (karte/ → <Ausgabe>/karte/) in den Eleventy-Build: Markdown-Daten und Tests sind keine
 * Seiten, JS/CSS/Schemas werden kopiert. Die Daten selbst lädt karte/karte.11tydata.js (karte/lib/laden.js).
 */
import { absaetzeHtml } from './html.js';

export function richteKarteEin(eleventyConfig) {
  eleventyConfig.ignores.add('karte/daten/**');
  eleventyConfig.ignores.add('karte/test/**');
  eleventyConfig.addPassthroughCopy({ 'karte/js': 'js', 'karte/css': 'css', 'karte/schemas': 'schemas' });
  eleventyConfig.addFilter('absaetze', absaetzeHtml);
}
