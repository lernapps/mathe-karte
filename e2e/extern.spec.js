// Datensparsamkeit (#26, T-001): Vor jeder Nutzeraktion fragt keine Seite einen fremden Server an, und keine wirft
// einen Fehler in der Konsole. Videos sind seit dem explainer (ADR-033) einfache Links.
import { test, expect } from "playwright/test";
import { alleSeiten, sammleFehler } from "./seiten.js";

for (const pfad of alleSeiten) {
  test(`keine externe Anfrage und kein Konsolenfehler vor dem Klick: /${pfad}`, async ({ page, baseURL }) => {
    const eigene = new URL(baseURL).origin;
    const fremde = [];
    const fehler = sammleFehler(page);
    page.on("request", (r) => {
      const url = r.url();
      if (/^(data|blob|about):/.test(url)) return;
      if (new URL(url).origin !== eigene) fremde.push(url);
    });
    await page.goto(pfad, { waitUntil: "networkidle" });
    expect(fremde).toEqual([]);
    expect(fehler).toEqual([]);
  });
}
