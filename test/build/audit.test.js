// Use Case: Abhängigkeiten prüfen (ADR-033) – npm audit bricht bei high/critical ab, außer bei einer gültigen Ausnahme.
import { test } from "node:test";
import assert from "node:assert/strict";
import { bewerteAudit, AUSNAHMEN } from "../../scripts/audit.js";

const bericht = (severity, url = "https://github.com/advisories/GHSA-x") => ({
  vulnerabilities: { paket: { via: [{ severity, url, title: "Lücke" }, "anderes-paket"] } },
});
const ausnahme = [{ advisory: "https://github.com/advisories/GHSA-x", paket: "paket", grund: "g", bis: "2027-01-31" }];

test("high und critical ohne Ausnahme sind Fehler, moderate und low nicht", () => {
  assert.equal(bewerteAudit(bericht("high"), "2026-10-24", []).length, 1);
  assert.equal(bewerteAudit(bericht("critical"), "2026-10-24", []).length, 1);
  assert.deepEqual(bewerteAudit(bericht("moderate"), "2026-10-24", []), []);
  assert.deepEqual(bewerteAudit(bericht("low"), "2026-10-24", []), []);
});

test("eine gültige Ausnahme lässt die Warnung durch, eine abgelaufene nicht", () => {
  assert.deepEqual(bewerteAudit(bericht("high"), "2027-01-31", ausnahme), []);
  assert.match(bewerteAudit(bericht("high"), "2027-02-01", ausnahme)[0], /abgelaufen/);
  assert.equal(bewerteAudit(bericht("high", "https://github.com/advisories/GHSA-y"), "2026-10-24", ausnahme).length, 1);
});

test("jede Ausnahme hat Grund und Ablaufdatum, spätestens 30.04.2027 (dann neu bewerten)", () => {
  for (const a of AUSNAHMEN) {
    assert.ok(a.grund.length > 20 && /^\d{4}-\d\d-\d\d$/.test(a.bis), a.advisory);
    assert.ok(a.bis <= "2027-04-30", `${a.advisory}: Ablauf zu weit weg`);
  }
});
