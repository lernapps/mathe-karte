// ESLint Flat Config (#21): Pflicht-Check gegen gefährliche Muster (Bedrohung T-003, XSS über DOM-Injektion).
// Nur Korrektheit und Sicherheit, keine Formatierung.
import js from "@eslint/js";
import nounsanitized from "eslint-plugin-no-unsanitized";
import globals from "globals";

export default [
  // src/ ist der explainer (YAML, TypeScript, Vue): den prüft vite-plus mit dem Lint-Plugin von lernapps (vp check).
  { ignores: ["_site/", "dist/", "build/", "node_modules/", ".claude/worktrees/", "src/"] },
  js.configs.recommended,
  nounsanitized.configs.recommended,
  {
    rules: {
      "no-eval": "error",
      "no-implied-eval": "error",
      // Rest-Destructuring zum Weglassen eines Feldes ist Absicht, keine tote Variable.
      "no-unused-vars": ["error", { ignoreRestSiblings: true }],
    },
  },
  // Browser-Code: die interaktive Karte und das Theme der Architektur-Doku.
  {
    files: ["karte/js/**/*.js", "docs/site/**/*.js"],
    languageOptions: { globals: { ...globals.browser } },
  },
  // Node-Code: Build, Tests, Skripte, Eleventy-Datendateien.
  {
    files: [
      "*.js",
      "lib/**/*.js",
      "test/**/*.js",
      "scripts/**/*.js",
      "scripts/**/*.mjs",
      "karte/test/**/*.js",
      "karte/lib/**/*.js",
      "karte/_data/**/*.js",
      "karte/*.11tydata.js",
      "karte/daten/**/*.js",
    ],
    languageOptions: { globals: { ...globals.node } },
    // Kein DOM unter Node, T-003 betrifft nur den Browser.
    rules: { "no-unsanitized/method": "off", "no-unsanitized/property": "off" },
  },
  // Browser-Tests (#26): Node, aber page.evaluate() führt einzelne Funktionen im Browser aus.
  {
    files: ["e2e/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: { "no-unsanitized/method": "off", "no-unsanitized/property": "off" },
  },
];
