// Browser-Tests (#26, TD-5) gegen das gebaute dist/, ausgeliefert von vp preview, in Chromium am Desktop und bei
// 360 px (Konfiguration von @lernapps/tooling/playwright): die Tests des explainers (e2e/explainer.e2e.ts) und die
// eigenen über alle Seiten samt Karte (e2e/*.spec.js: axe, keine externe Anfrage, kein Überlauf, ohne JS).
// lernapps check führt sie aus; lokal: npm run build && npm run test:browser.
import { playwright } from "@lernapps/tooling/playwright";

export default playwright({ testMatch: ["*.e2e.ts", "*.spec.js"] });
