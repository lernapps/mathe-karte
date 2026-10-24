// Build der Site: der explainer von lernapps.net (src/ → dist/) und danach die Mathe-Karte mit Eleventy
// (karte/ → dist/karte/, eleventy.config.js), die zum Schluss die ganze Ausgabe prüft. Lint und Format von vite-plus
// gelten dem explainer; der JavaScript-Teil (Karte, lib/, scripts/, test/, e2e/) hat ESLint (eslint.config.js).
import { lernapps } from "@lernapps/tooling/preset";
import { explainer } from "@lernapps/app-templates/explainer/plugin";
import { karte } from "./karte/lib/vite-plugin.js";

const javascriptTeil = [
  "karte/**",
  "lib/**",
  "scripts/**",
  "test/**",
  "e2e/**/*.js",
  "docs/**",
  "werkzeuge/**",
  "*.js",
];

export default lernapps({
  plugins: [explainer(), karte()],
  fmt: { ignorePatterns: javascriptTeil },
  lint: { ignorePatterns: javascriptTeil },
});
