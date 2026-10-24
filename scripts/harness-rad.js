/*
 * Harness-Rad für arc42 8.16: zeichnet das "Harness Coverage Wheel" als statisches SVG und schreibt die
 * Inventar-Tabelle als AsciiDoc. Schichten, Abschnitte, Klassen (G/A/R) und Mindest-Tier stammen aus
 * https://llm-coding.github.io/Semantic-Anchors/harness-coverage-wheel.html (Semantic Anchors,
 * Ralf D. Müller u. a., Apache-2.0). Zeichnung und Status sind eigene Arbeit dieses Repos.
 *   node scripts/harness-rad.js   → docs/images/harness-rad.svg, docs/arc42/chapters/_harness-inventar.adoc,
 *                                   docs/arc42/chapters/_harness-original.adoc (Link und Einbettung, ADR-025)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { schreibeOriginalAbschnitt } from "./harness-rad-original.js";

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ZIELE = {
  svg: path.join(WURZEL, "docs/images/harness-rad.svg"),
  adoc: path.join(WURZEL, "docs/arc42/chapters/_harness-inventar.adoc"),
  original: path.join(WURZEL, "docs/arc42/chapters/_harness-original.adoc"),
};
export const TIER = 2; // Risk Radar, EPIC #18

export const ABSCHNITTE = [
  { name: "Build & Language", kurz: "Build" }, { name: "Testing", kurz: "Testing" },
  { name: "Security", kurz: "Security" }, { name: "Architecture", kurz: "Architecture" },
  { name: "Data & Schema", kurz: "Data" }, { name: "UX & A11y", kurz: "UX & A11y" },
  { name: "Operations", kurz: "Operations" }, { name: "Formal Methods", kurz: "Formal" },
  { name: "Documentation", kurz: "Docs" },
];

// [id, Name, Klasse G/A/R, Mindest-Tier, Status, Beleg]
const B = "Build & Language", T = "Testing", S = "Security", A = "Architecture", D = "Data & Schema";
const U = "UX & A11y", O = "Operations", F = "Formal Methods", Doc = "Documentation";
const ROH = [
  [B, "compiler", "Compiler / Parser", "G", 1, "vorhanden", "`npm test` und `npm run build` laden jedes Modul; der explainer validiert jede YAML-Datei gegen sein Schema und bricht den Build mit Datei und Zeile (ADR-033)"],
  [B, "type-checker", "Type checker", "G", 1, "vorhanden", "`vp check` (oxlint typgeprüft, TypeScript in `src/`) und `vue-tsc --noEmit` über die Vue-Komponenten, `npm run typecheck` im Pflicht-Check `test-und-build` (ADR-033)"],
  [B, "formatter", "Formatter", "G", 1, "vorhanden", "`vp fmt` über `src/` (explainer) in `vp check`, Pflicht-Check `test-und-build`; der JavaScript-Teil (Karte, Skripte) hat keinen Formatter, ADR-033"],
  [B, "import-sorter-dead-code", "Import sorter / dead code", "G", 1, "offen", ""],
  [B, "linter", "Linter", "A", 1, "vorhanden", "ESLint (`eslint.config.js`: no-eval, no-implied-eval, no-unsanitized) im Pflicht-Check, #21"],
  [T, "unit-tests", "Unit tests", "R", 2, "vorhanden", "`node:test`-Tests in `test/` und `karte/test/`, Komponententests `src/components/*.test.ts` mit `vp test`, alles in `npm test` im Pflicht-Check `test-und-build`"],
  [T, "property-based-fuzz", "Property-based / fuzz", "R", 4, "vorhanden", "Der Build des explainers prüft jede `generated`-Übung über 200 feste Seeds (Lösung definiert, im Format, kein typischer Fehler gleich der Lösung) und jede Übungskomponente über 50 Seeds (Lösung besteht, falsche Antwort fällt durch), ADR-033"],
  [T, "mutation-testing", "Mutation testing", "R", 4, "offen", ""],
  [T, "integration-tests", "Integration tests", "R", 2, "vorhanden", "`lernapps check` baut die Site und prüft das gebaute `dist/` gegen die Plattform-Regeln von lernapps.net (Pflicht-Check `browser`)"],
  [T, "contract-tests", "Contract tests", "R", 3, "vorhanden", "Tutor-Vertrag: der explainer prüft jeden Link und Anker in `llms.txt` und jedem `tutor.md` gegen die Seiten (Build); die Karte prüft ihre Seiten-ids gegen die Kapitel (`karte/lib/kapitel.js`)"],
  [T, "bdd-acceptance-tests", "BDD / acceptance tests", "R", 3, "offen", ""],
  [T, "end-to-end-ui", "End-to-end / UI", "R", 3, "vorhanden", "Playwright (Chromium, Desktop und 360 px) in `lernapps check`, Workflow `browser.yml`: die Tests des explainers für jede Seite und Übung (`e2e/explainer.e2e.ts`) und eigene über alle Seiten samt Karte (360 px, ohne JS, `e2e/`)"],
  [T, "snapshot-visual-regression", "Snapshot / visual regression", "R", 3, "offen", ""],
  [T, "performance-benchmark", "Performance / benchmark", "R", 3, "offen", ""],
  [T, "smoke-tests", "Smoke tests", "R", 2, "vorhanden", "`e2e/extern.spec.js`: jede Seite ohne fremde Requests und ohne Konsolenfehler, #26"],
  [S, "secret-scanning", "Secret scanning", "G", 1, "vorhanden", "GitHub Secret Scanning mit Push Protection"],
  [S, "sca", "SCA", "G", 1, "vorhanden", "Dependabot-Alerts und -Security-Updates; `npm run audit` (high/critical, Ausnahmen nur mit Grund und Ablaufdatum in `scripts/audit.js`) im Pflicht-Check, #20, ADR-033; Dependency Review prüft neue Abhängigkeiten jedes PRs auf Schwachstellen ab „high“ (Pflicht-Check `abhaengigkeiten`, ADR-029)"],
  [S, "container-image-scanning", "Container / image scanning", "G", 2, "entfällt", "keine Container: statische Seiten auf GitHub Pages"],
  [S, "iac-scanning", "IaC scanning", "G", 2, "entfällt", "keine Infrastruktur als Code; Workflows prüft CodeQL (`actions`)"],
  [S, "supply-chain-sbom-slsa", "Supply chain / SBOM", "G", 3, "offen", ""],
  [S, "compliance-scanning", "Compliance scanning", "G", 3, "offen", ""],
  [S, "license-compliance", "License compliance", "G", 2, "vorhanden", "`lib/pruefe-lizenzen.js` in `npm test` (Allowlist je Verwendung, Lizenzköpfe unter `vendor/`), Dependency Review in PRs (Pflicht-Check `abhaengigkeiten`), ADR-029"],
  [S, "sast", "SAST", "A", 2, "vorhanden", "CodeQL Default Setup (JavaScript/TypeScript, Actions)"],
  [S, "dast", "DAST", "A", 3, "offen", ""],
  [S, "iast", "IAST", "A", 4, "entfällt", "kein Server, keine Laufzeit-Instrumentierung"],
  [S, "llm-security-review", "LLM security review", "A", 2, "vorhanden", "OWASP-Teil des KI-Reviews (`werkzeuge/review/ki-review.md`), Check `ki-review`, #24, ADR-027"],
  [S, "threat-modeling", "Threat modeling", "R", 3, "vorhanden", "STRIDE-Tabelle in arc42 8.1 (T-IDs); das KI-Review prüft jedes neue Feature dagegen (`werkzeuge/review/ki-review.md`, Punkt 3), Check `ki-review`"],
  [A, "complexity-metrics", "Complexity metrics", "G", 2, "verworfen", "SonarQube abgelehnt (#28); nur Dateilänge ≤ 500 Zeilen"],
  [A, "api-contract-lint", "API contract lint", "A", 2, "entfällt", "keine API"],
  [A, "fagan-inspection", "Fagan inspection", "R", 4, "offen", ""],
  [A, "code-review", "Code review", "R", 2, "vorhanden", "Der Product Owner merged jeden PR selbst; ein Pflicht-Approval kann GitHub bei nur einem Maintainer nicht verlangen – erzwungen wird das Review über den Pflicht-Check `ki-review` (ADR-027)"],
  [A, "llm-code-review", "LLM code review", "A", 2, "vorhanden", "KI-Review in frischem Kontext vor jedem Merge (`werkzeuge/review/ki-review.md`), Check `ki-review`, #24, ADR-027"],
  [A, "archunit-dependency-cruiser", "ArchUnit / dependency-cruiser", "R", 3, "offen", ""],
  [A, "adr-enforcement", "ADR enforcement", "R", 3, "vorhanden", "`eleventy.config.js` bricht den Build bei Regelverstößen über die ganze Ausgabe (fremde Ressourcen, Zeilengrenze, ADR-008), auch bei Links außerhalb der Tutor-Allowlist (`pruefeTutorLinks`, ADR-023); das Lint-Plugin von lernapps.net verbietet Netzwerk, `innerHTML` und `eval` in Komponenten"],
  [A, "spec-traceability", "Spec traceability", "R", 3, "offen", ""],
  [A, "atam", "ATAM", "R", 4, "vorhanden", "Baseline vom 25.09.2026 mit Utility Tree (arc42 10, 11), Wiederholung je Quartal mit dem Harness-Audit, ADR-030"],
  [A, "schema-diff", "Schema diff", "R", 3, "entfällt", "keine Datenbank"],
  [A, "llm-design-review", "LLM design review", "R", 2, "vorhanden", "Abschnitt „Architektur (ATAM)“ im KI-Review, sobald ein PR ADRs oder arc42-Kapitel 1, 4, 5, 9 oder 10 ändert; der Check `ki-review` erzwingt ihn (ADR-030)"],
  [D, "json-schema-openapi-validation", "Schema validation", "A", 2, "vorhanden", "Der explainer validiert jede Inhaltsdatei gegen `explainer.v1.schema.json`; Kartendaten prüft `pruefeReferenzen` in `karte/lib/daten.js` (Pflichtfelder, Enum-Werte); die JSON-Schemas in `karte/schemas/` prüft kein Build"],
  [D, "db-migration-dry-run", "DB migration dry-run", "A", 2, "entfällt", "keine Datenbank"],
  [D, "pii-scanner", "PII scanner", "A", 3, "entfällt", "keine personenbezogenen Daten (Risk Radar: Data 0)"],
  [D, "config-validation", "Config validation", "R", 2, "vorhanden", "Die Karte prüft `karte/daten/kapitel.js` gegen die Kapitel des explainers (`karte/lib/kapitel.js`); unbekanntes Fach bricht den Build (`lib/fachfarben.js`)"],
  [D, "data-contract", "Data contract", "R", 3, "vorhanden", "Karten-Knoten müssen existieren: `pruefeReferenzen` bricht den Build (`karte/lib/laden.js`), Tests in `karte/test/daten-build.test.js`"],
  [U, "accessibility-automated", "Accessibility automated", "G", 2, "vorhanden", "axe-core, WCAG 2.2 AA, 0 schwere/kritische Verstöße auf jeder Seite des explainers und der Karte (`e2e/axe.spec.js`), #26, R-030; dazu die Prüfungen des explainers (Überschriften, Anker, Formeln als MathML)"],
  [U, "contrast-checker", "Contrast checker", "G", 2, "vorhanden", "WCAG-Kontrast je Fachfarbe (`test/build/fachfarben.test.js`)"],
  [U, "cross-browser-tests", "Cross-browser tests", "G", 3, "offen", ""],
  [U, "ui-prose-lint", "UI prose lint", "G", 2, "offen", "Kein PR, kein Werkzeug. Vorhanden ist nur eine Regex: Tutor-Texte nennen keinen Wettbewerb (`pruefeTutorText`, #29). Es fehlt ein Prose-Linter für UI-Texte (Anrede „du“, Terminologie, Satzlänge)"],
  [U, "accessibility-manual", "Accessibility manual", "A", 3, "offen", ""],
  [U, "i18n-lint", "i18n lint", "A", 3, "entfällt", "nur Deutsch"],
  [U, "visual-regression", "Visual regression", "R", 3, "offen", ""],
  [O, "distributed-tracing", "Distributed tracing", "G", 2, "entfällt", "keine Laufzeit-Telemetrie (arc42 8.4)"],
  [O, "canary-progressive-delivery", "Canary delivery", "A", 3, "entfällt", "statisches Hosting"],
  [O, "anomaly-detection", "Anomaly detection", "A", 3, "entfällt", "keine Laufzeit-Telemetrie (arc42 8.4)"],
  [O, "runtime-assertions-invariants", "Runtime assertions", "R", 2, "offen", ""],
  [O, "health-checks", "Health checks", "R", 2, "entfällt", "kein Dienst, nur statische Dateien"],
  [O, "observability-gates", "Observability gates", "R", 3, "entfällt", "keine Laufzeit-Telemetrie (arc42 8.4)"],
  [O, "chaos-engineering", "Chaos engineering", "R", 4, "entfällt", "kein verteiltes System"],
  [O, "feature-flags", "Feature flags", "R", 2, "entfällt", "kein Server; Rücknahme per Revert"],
  [F, "symbolic-execution", "Symbolic execution", "G", 4, "offen", ""],
  [F, "type-driven-design", "Type-driven design", "G", 3, "offen", ""],
  [F, "formal-verification", "Formal verification", "R", 4, "offen", ""],
  [F, "model-checker", "Model checker", "R", 4, "offen", ""],
  [Doc, "markdown-asciidoc-lint", "Markdown / AsciiDoc lint", "G", 1, "vorhanden", "asciidoc-linter (docToolchain) prüft `docs` in `doku.yml`, per Commit-SHA gepinnt (ADR-028); Überschriften-, Block-, Bild- und Markdown-Regeln feuern seit docToolchain/asciidoc-linter#62. ERRORs brechen den Doku-Job (`scripts/doku-lint.js`), WARNINGs sind Annotationen; kein Pflicht-Check, Markdown-Dateien prüft er nicht"],
  [Doc, "link-checker", "Link checker", "G", 1, "vorhanden", "Jedes interne href/src in `dist` führt auf eine Datei, jeder #anker auf eine id (`pruefeLinks` in `lib/pruefe-links.js`, bricht den Build); der explainer prüft jeden Link in Inhalt, `llms.txt` und `tutor.md`; Verweise auf die Doku (`test/build/doku-verweise.test.js`); externe Links prüft der Build nicht"],
  [Doc, "code-in-docs-validation", "Code-in-docs validation", "G", 2, "offen", ""],
  [Doc, "spell-check", "Spell check", "G", 1, "offen", ""],
  [Doc, "diagram-build", "Diagram build", "G", 2, "vorhanden", "`doku.yml` baut PlantUML und prüft die Ausgabe in jedem PR, der Doku oder Doku-Build ändert (kein Pflicht-Check); `pages.yml` baut sie vor jedem Deployment"],
  [Doc, "prose-lint", "Prose lint", "A", 2, "offen", "Kein PR, kein Werkzeug. Vorhanden ist nur die Längengrenze: `tutor.md` unter 120 Zeilen (`MAX_TUTOR_ZEILEN`, #29). Es fehlt ein Prose-Linter für Doku und Kompetenztexte (Stil, Satzlänge, Terminologie)"],
  [Doc, "doc-code-drift", "Doc-code drift", "R", 3, "vorhanden", "Die Karte prüft ihre Seiten-ids gegen die Kapitel des explainers (`karte/lib/kapitel.js`); Kontext (arc42 3) und Bausteinsicht (arc42 5) nennen dieselben Personen und Fremdsysteme (`test/build/kontext-bausteine.test.js`)"],
];
export const SCHICHTEN = ROH.map(([abschnitt, id, name, klasse, tier, status, beleg]) =>
  ({ abschnitt, id, name, klasse, tier, status, beleg }));

/** Zählt Schichten bis `tier`; entfallene zählen nicht mit (im Original: „not applicable“). */
export function abdeckung(schichten, tier = TIER) {
  const imTier = schichten.filter((s) => s.tier <= tier);
  const relevant = imTier.filter((s) => s.status !== "entfällt");
  const vorhanden = relevant.filter((s) => s.status === "vorhanden").length;
  return { imTier: imTier.length, relevant: relevant.length, vorhanden,
    anteil: relevant.length ? vorhanden / relevant.length : 0 };
}

const FARBE = { G: "#2b8a3e", A: "#e67700", R: "#c92a2a" };
const ESC = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const n1 = (x) => Math.round(x * 10) / 10;
const CX = 400, CY = 320, R0 = 92, RMAX = 226, RDOT = 244, RLABEL = 286;
const xy = (r, grad) => { const a = (grad - 90) * Math.PI / 180; return [n1(CX + r * Math.cos(a)), n1(CY + r * Math.sin(a))]; };
function ring(rIn, rOut, a0, a1) {
  const [x0, y0] = xy(rOut, a0), [x1, y1] = xy(rOut, a1), [x2, y2] = xy(rIn, a1), [x3, y3] = xy(rIn, a0);
  return `M${x0} ${y0} A${rOut} ${rOut} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${rIn} ${rIn} 0 0 0 ${x3} ${y3} Z`;
}

/** Form = Klasse (Kreis extrinsisch, Quadrat hybrid, Dreieck intrinsisch), Füllung = Status. */
function marke(s, x, y) {
  const c = FARBE[s.klasse];
  const stil = {
    vorhanden: `fill="${c}" stroke="${c}"`,
    "in Arbeit": `fill="url(#halb-${s.klasse})" stroke="${c}"`,
    geplant: `fill="#fff" stroke="${c}" stroke-dasharray="2 1.5"`,
    offen: `fill="#fff" stroke="${c}"`,
    verworfen: `fill="#fff" stroke="#868e96"`,
    "entfällt": `fill="#e9ecef" stroke="#adb5bd"`,
  }[s.status];
  const blass = s.tier > TIER && s.status !== "vorhanden" ? ' opacity="0.3"' : "";
  const titel = `<title>${ESC(`${s.name} – ${s.status}, Tier ${s.tier}${s.beleg ? `: ${s.beleg.replace(/`/g, "")}` : ""}`)}</title>`;
  const attr = `${stil} stroke-width="1.4"${blass}`;
  if (s.klasse === "A") return `<rect x="${n1(x - 4.3)}" y="${n1(y - 4.3)}" width="8.6" height="8.6" rx="1" ${attr}>${titel}</rect>`;
  if (s.klasse === "R") {
    const p = [[0, -6.4], [5.5, 3.2], [-5.5, 3.2]].map(([dx, dy]) => `${n1(x + dx)},${n1(y + dy)}`).join(" ");
    return `<polygon points="${p}" ${attr}>${titel}</polygon>`;
  }
  return `<circle cx="${x}" cy="${y}" r="4.8" ${attr}>${titel}</circle>`;
}

export function zeichneRad(schichten) {
  const teile = [];
  const breite = 360 / ABSCHNITTE.length, luecke = 4;
  ABSCHNITTE.forEach((ab, i) => {
    const a0 = i * breite + luecke / 2, a1 = (i + 1) * breite - luecke / 2, mitte = (i + 0.5) * breite;
    const eigene = schichten.filter((s) => s.abschnitt === ab.name);
    const { relevant, anteil } = abdeckung(eigene);
    teile.push(`<path d="${ring(R0, RMAX, a0, a1)}" fill="#f1f3f5"/>`);
    if (anteil > 0) teile.push(`<path d="${ring(R0, R0 + anteil * (RMAX - R0), a0, a1)}" fill="#1d4ed8" fill-opacity="0.28"/>`);
    eigene.forEach((s, k) => {
      const [x, y] = xy(RDOT, a0 + (a1 - a0) * ((k + 0.5) / eigene.length));
      teile.push(marke(s, x, y));
    });
    const [tx, ty] = xy(RLABEL, mitte);
    const anker = mitte > 10 && mitte < 170 ? "start" : mitte > 190 && mitte < 350 ? "end" : "middle";
    const txt = relevant ? `${Math.round(anteil * 100)} %` : "–";
    teile.push(`<text x="${tx}" y="${ty}" text-anchor="${anker}" font-size="13" font-weight="600" fill="#212529">${ESC(ab.kurz)}</text>`);
    teile.push(`<text x="${tx}" y="${n1(ty + 15)}" text-anchor="${anker}" font-size="12" fill="#495057">${txt}</text>`);
  });
  const ges = abdeckung(schichten);
  teile.push(`<circle cx="${CX}" cy="${CY}" r="${R0 - 8}" fill="#fff" stroke="#dee2e6"/>`);
  teile.push(`<text x="${CX}" y="${CY + 4}" text-anchor="middle" font-size="30" font-weight="700" fill="#1d4ed8">${Math.round(ges.anteil * 100)} %</text>`);
  teile.push(`<text x="${CX}" y="${CY + 24}" text-anchor="middle" font-size="11" fill="#495057">${ges.vorhanden} von ${ges.relevant}</text>`);
  teile.push(`<text x="${CX}" y="${CY + 38}" text-anchor="middle" font-size="11" fill="#495057">Tier ${TIER}</text>`);
  const legende = [
    [{ klasse: "G", status: "vorhanden" }, "extrinsisch (Kreis)"], [{ klasse: "A", status: "vorhanden" }, "hybrid (Quadrat)"],
    [{ klasse: "R", status: "vorhanden" }, "intrinsisch (Dreieck)"], [{ klasse: "G", status: "vorhanden" }, "vorhanden"],
    [{ klasse: "G", status: "in Arbeit" }, "in Arbeit (offener PR)"], [{ klasse: "G", status: "geplant" }, "geplant (Issue)"],
    [{ klasse: "G", status: "offen" }, "offen"], [{ klasse: "G", status: "verworfen" }, "verworfen"],
    [{ klasse: "G", status: "entfällt" }, "entfällt (zählt nicht)"], [{ klasse: "G", status: "offen", tier: 3 }, "über Tier 2, nicht vorhanden (blass)"],
  ];
  legende.forEach(([s, text], i) => {
    const x = 70 + (i % 4) * 180, y = 634 + Math.floor(i / 4) * 22;
    teile.push(marke({ name: text, tier: 1, beleg: "", ...s }, x, y).replace(/<title>.*<\/title>/, ""));
    teile.push(`<text x="${x + 10}" y="${y + 4}" font-size="11" fill="#343a40">${ESC(text)}</text>`);
  });
  teile.push(`<text x="${CX}" y="712" text-anchor="middle" font-size="10.5" fill="#868e96">Modell: Harness Coverage Wheel, llm-coding.github.io/Semantic-Anchors (Apache-2.0) · eigene Zeichnung, Stand lernapps</text>`);
  const halb = Object.entries(FARBE).map(([k, c]) =>
    `<linearGradient id="halb-${k}"><stop offset="50%" stop-color="${c}"/><stop offset="50%" stop-color="#fff"/></linearGradient>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 724" width="800" height="724" role="img" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif">
<title>Harness Coverage Wheel für lernapps (Tier ${TIER}): ${Math.round(ges.anteil * 100)} % abgedeckt</title>
<defs>${halb}</defs>
<rect width="800" height="724" fill="#fff"/>
${teile.join("\n")}
</svg>
`;
}

const TABELLE_STATUS = ["vorhanden", "in Arbeit", "geplant"];
export function schreibeInventar(schichten) {
  const z = [
    "// Erzeugt von scripts/harness-rad.js – nicht von Hand ändern.", "",
    '[cols="2,2,5,4",options="header"]', "|===", "| Abschnitt | Stufe (Tier 2) | Nachweis | Lücke",
  ];
  for (const ab of ABSCHNITTE) {
    const eigene = schichten.filter((s) => s.abschnitt === ab.name);
    const a = abdeckung(eigene);
    const stufe = a.relevant ? `${a.vorhanden} von ${a.relevant} (${Math.round(a.anteil * 100)} %)` : "entfällt";
    const zeile = (s) => `${s.name}: ${s.beleg}`;
    const nachweis = eigene.filter((s) => s.status === "vorhanden").map(zeile);
    const imTier = eigene.filter((s) => s.tier <= TIER && s.status !== "entfällt" && s.status !== "vorhanden");
    const luecke = imTier.map((s) => (TABELLE_STATUS.includes(s.status) || s.status === "verworfen")
      ? `${s.name} (${s.status}: ${s.beleg})` : `${s.name} (offen)`);
    z.push(`| ${ab.name} | ${stufe} | ${nachweis.join("; ") || "–"} | ${luecke.join("; ") || "–"}`);
  }
  z.push("|===", "");
  const ges = abdeckung(schichten);
  z.push(`Gesamt bis Tier ${TIER}: ${ges.vorhanden} von ${ges.relevant} zutreffenden Schichten ` +
    `(${Math.round(ges.anteil * 100)} %); entfallene Schichten zählen nicht mit.`, "");
  return z.join("\n");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  fs.writeFileSync(ZIELE.svg, zeichneRad(SCHICHTEN));
  fs.writeFileSync(ZIELE.adoc, schreibeInventar(SCHICHTEN));
  fs.writeFileSync(ZIELE.original, schreibeOriginalAbschnitt(SCHICHTEN, abdeckung(SCHICHTEN), TIER));
  const a = abdeckung(SCHICHTEN);
  console.log(`Harness-Rad: ${a.vorhanden}/${a.relevant} (${Math.round(a.anteil * 100)} %) bis Tier ${TIER}`);
}
