// Build der Site: der explainer von lernapps.net (src/ → dist/) und danach die Mathe-Karte mit Eleventy
// (karte/ → dist/karte/, eleventy.config.js). Lint und Format von vite-plus gelten dem explainer; die Tests der
// Karte und der Build-Teile (karte/test/, test/build/) laufen mit vp test wie die der Komponenten.
import { lernapps } from "@lernapps/tooling/preset";
import { explainer } from "@lernapps/app-templates/explainer/plugin";
import { karte } from "./karte/lib/vite-plugin.js";

const javascriptTeil = [".claude/worktrees/**", "karte/**", "lib/**", "scripts/**", "test/**", "*.js"];

export default lernapps({
  plugins: [explainer(), karte()],
  fmt: { ignorePatterns: javascriptTeil },
  lint: { ignorePatterns: javascriptTeil },
  test: { include: ["karte/test/**/*.test.js", "test/**/*.test.js"] },
});
