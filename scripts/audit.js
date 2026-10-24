/*
 * npm audit mit Ausnahmeliste (ADR-033): bricht ab bei jeder Sicherheitswarnung der Stufe high oder critical, außer
 * sie steht in AUSNAHMEN, mit Grund und Ablaufdatum. Grund für die Liste: lernapps.net pinnt vite-plus exakt
 * (Peer-Dependency von @lernapps/tooling); eine Lücke im Dev-Server lässt sich erst mit `lernapps update` schließen.
 * Eine abgelaufene Ausnahme bricht den Build wie eine neue Warnung.
 *   node scripts/audit.js            (liest `npm audit --json` selbst)
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

const STUFEN = new Set(["high", "critical"]);

export const AUSNAHMEN = [
  {
    advisory: "https://github.com/advisories/GHSA-587h-7wmj-h5pm",
    paket: "vite-plus",
    grund: "launch-editor im Dev-Server (vp dev), nur unter Windows; Build und Auslieferung (statisches HTML) nutzen ihn nicht. Behoben ab vite-plus 1.3.0, das @lernapps/tooling noch nicht erlaubt.",
    bis: "2027-01-31",
  },
];

/** Fehlermeldungen für einen geparsten `npm audit --json`-Bericht am Tag `heute` (YYYY-MM-DD). */
export function bewerteAudit(bericht, heute, ausnahmen = AUSNAHMEN) {
  const fehler = [];
  for (const [paket, v] of Object.entries(bericht?.vulnerabilities ?? {})) {
    for (const via of v.via ?? []) {
      if (typeof via !== "object" || !STUFEN.has(via.severity)) continue;
      const ausnahme = ausnahmen.find((a) => a.advisory === via.url && a.paket === paket);
      if (!ausnahme) fehler.push(`${paket}: ${via.severity} ${via.url} (${via.title})`);
      else if (ausnahme.bis < heute) fehler.push(`${paket}: Ausnahme für ${via.url} ist am ${ausnahme.bis} abgelaufen`);
    }
  }
  return [...new Set(fehler)];
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const lauf = spawnSync("npm", ["audit", "--json"], { encoding: "utf8" });
  const fehler = bewerteAudit(JSON.parse(lauf.stdout || "{}"), new Date().toISOString().slice(0, 10));
  if (fehler.length) {
    console.error(`npm audit: ${fehler.length} Warnung(en) high/critical ohne gültige Ausnahme\n  ✗ ${fehler.join("\n  ✗ ")}`);
    process.exit(1);
  }
  console.log(`npm audit: keine Warnung high/critical ohne Ausnahme (${AUSNAHMEN.length} Ausnahme(n), scripts/audit.js)`);
}
