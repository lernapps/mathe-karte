// Mobile-first (#26): Bei 360 px Breite scrollt keine Seite waagerecht – ohne JS und mit JS (Übungen geladen).
import { test, expect } from "playwright/test";
import { alleSeiten } from "./seiten.js";

const BREITE = { width: 360, height: 800 };
const ueberlauf = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

for (const javaScriptEnabled of [false, true]) {
  test.describe(javaScriptEnabled ? "mit JS" : "ohne JS", () => {
    test.use({ viewport: BREITE, javaScriptEnabled });
    for (const pfad of alleSeiten) {
      test(`kein waagerechter Überlauf bei 360 px: /${pfad}`, async ({ page }) => {
        await page.goto(pfad, { waitUntil: "networkidle" });
        expect(await ueberlauf(page)).toBeLessThanOrEqual(0);
      });
    }
  });
}
