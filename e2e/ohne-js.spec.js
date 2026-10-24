// Ohne JavaScript (#26, Projektregel "Text UND Bild"): Auf jeder Inhaltsseite sind Regel und Übung lesbar, und das
// Bild (Abschnitt #bild) ist als SVG oder Grafik sichtbar. Die Prüfungen des explainers selbst: explainer.e2e.ts.
import { test, expect } from "playwright/test";
import { inhaltsSeiten } from "./seiten.js";

test.use({ javaScriptEnabled: false });

for (const pfad of inhaltsSeiten) {
  test(`ohne JS: Regel, Übung und Bild sichtbar auf /${pfad}`, async ({ page }) => {
    await page.goto(pfad);
    // Der explainer setzt die id eines Abschnitts auf seine Überschrift: <section><h2 id="bild">.
    await expect(page.locator("h2[id='regel']")).toBeVisible();
    await expect(page.locator("h2[id='uebung']")).toBeVisible();
    const abschnitt = page.locator("section:has(> h2[id='bild'])");
    await expect(abschnitt).toHaveCount(1);
    const bild = abschnitt.locator("svg, img").first();
    await expect(bild).toBeVisible();
    const box = await bild.boundingBox();
    expect(box.width).toBeGreaterThan(20);
    expect(box.height).toBeGreaterThan(20);
  });
}
