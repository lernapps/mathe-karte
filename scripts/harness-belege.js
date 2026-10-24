/*
 * Maschinenprüfbare Belege für jede „vorhanden“-Schicht des Harness-Rads (arc42 8.16), nach id.
 * Arten:  datei:<Pfad>                 Datei existiert
 *         skript:<npm-Skript>          steht in package.json
 *         job:<Workflow>#<Job>         .github/workflows/<Workflow> hat diesen Job
 *         pflicht:<Check>              ein Workflow hat einen Job dieses Namens; ob die Branch Protection ihn
 *                                      verlangt, prüft nur das Audit (GitHub-API, kein Unit-Test)
 *         regel:<ESLint-Regel>         in eslint.config.js eingeschaltet
 *         funktion:<Datei>#<Name>      die Datei exportiert diesen Namen
 *         github:<Einstellung>         Repo-Einstellung; prüft kein Test, nur das Audit (arc42 8.16)
 * Test: test/build/harness-rad.test.js.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const BELEGE = {
  compiler: ["skript:test", "skript:build", "job:pruefen.yml#test-und-build", "pflicht:test-und-build"],
  "type-checker": ["skript:typecheck", "datei:tsconfig.json", "job:pruefen.yml#test-und-build"],
  formatter: ["skript:typecheck", "pflicht:test-und-build"],
  linter: ["skript:lint", "regel:no-eval", "regel:no-implied-eval", "regel:no-unsanitized/method",
    "regel:no-unsanitized/property", "pflicht:test-und-build"],
  "unit-tests": ["skript:test", "datei:karte/test/kapitel-build.test.js", "pflicht:test-und-build"],
  "property-based-fuzz": ["skript:build", "datei:node_modules/@lernapps/app-templates/runtime/explainer/generated/soundness.ts",
    "pflicht:test-und-build"],
  "integration-tests": ["skript:check", "job:browser.yml#browser", "pflicht:browser"],
  "contract-tests": ["funktion:karte/lib/kapitel.js#pruefeKapitel", "datei:karte/test/kapitel-build.test.js", "skript:build"],
  "end-to-end-ui": ["skript:test:browser", "job:browser.yml#browser", "pflicht:browser", "datei:e2e/explainer.e2e.ts",
    "datei:e2e/ueberlauf.spec.js", "datei:e2e/ohne-js.spec.js", "datei:playwright.config.ts"],
  "smoke-tests": ["datei:e2e/extern.spec.js", "pflicht:browser"],
  "secret-scanning": ["github:secret_scanning", "github:secret_scanning_push_protection"],
  sca: ["github:vulnerability-alerts", "github:dependabot_security_updates", "job:pruefen.yml#test-und-build",
    "skript:audit", "funktion:scripts/audit.js#bewerteAudit",
    "job:abhaengigkeiten.yml#abhaengigkeiten"],
  sast: ["github:code-scanning/default-setup"],
  "license-compliance": ["funktion:lib/pruefe-lizenzen.js#pruefeLizenzen", "funktion:lib/pruefe-lizenzen.js#pruefeVendorKoepfe",
    "datei:test/build/pruefe-lizenzen.test.js", "job:abhaengigkeiten.yml#abhaengigkeiten", "pflicht:test-und-build", "pflicht:abhaengigkeiten"],
  "llm-security-review": ["datei:werkzeuge/review/ki-review.md", "job:ki-review.yml#ki-review", "pflicht:ki-review"],
  "threat-modeling": ["datei:docs/arc42/chapters/08_concepts.adoc", "datei:werkzeuge/review/ki-review.md",
    "pflicht:ki-review"],
  "code-review": ["github:branches/main/protection", "pflicht:ki-review"],
  "llm-code-review": ["datei:werkzeuge/review/ki-review.md", "datei:scripts/ki-review-pruefen.js",
    "job:ki-review.yml#ki-review", "pflicht:ki-review"],
  "llm-design-review": ["datei:werkzeuge/review/ki-review.md", "funktion:scripts/ki-review-pruefen.js#beruehrteArchitektur",
    "funktion:scripts/ki-review-pruefen.js#ARCHITEKTUR_PFADE", "datei:test/build/ki-review.test.js", "pflicht:ki-review"],
  atam: ["datei:docs/arc42/chapters/_atam-2026-09-25.adoc", "datei:docs/arc42/chapters/10_quality_requirements.adoc",
    "funktion:scripts/ki-review-pruefen.js#ARCHITEKTUR_PFADE"],
  "adr-enforcement": ["funktion:lib/pruefungen.js#pruefeExterneRessourcen", "funktion:lib/pruefungen.js#pruefeTutorLinks"],
  "json-schema-openapi-validation": ["skript:build", "funktion:karte/lib/daten.js#pruefeReferenzen"],
  "config-validation": ["funktion:karte/lib/kapitel.js#pruefeKapitel", "funktion:lib/fachfarben.js#fachfarbe"],
  "data-contract": ["funktion:karte/lib/daten.js#pruefeReferenzen", "datei:karte/lib/laden.js",
    "datei:karte/test/daten-build.test.js"],
  "accessibility-automated": ["datei:e2e/axe.spec.js", "pflicht:browser"],
  "contrast-checker": ["datei:test/build/fachfarben.test.js", "funktion:lib/fachfarben.js#kontrast"],
  "link-checker": ["funktion:lib/pruefe-links.js#pruefeLinks", "datei:test/build/pruefe-links.test.js",
    "datei:test/build/doku-verweise.test.js"],
  "markdown-asciidoc-lint": ["job:doku.yml#doku-bauen-und-pruefen", "funktion:scripts/doku-lint.js#bewerte",
    "datei:test/build/doku-lint.test.js"],
  "diagram-build": ["job:doku.yml#doku-bauen-und-pruefen", "job:pages.yml#build", "datei:scripts/dtc-v4.sh"],
  "doc-code-drift": ["funktion:karte/lib/kapitel.js#pruefeKapitel", "datei:test/build/kontext-bausteine.test.js"],
};

const lies = (datei) => fs.readFileSync(path.join(WURZEL, datei), "utf8");
const gibt = (datei) => fs.existsSync(path.join(WURZEL, datei));
const WORKFLOWS = ".github/workflows";

/** Job-ids eines Workflows: Schlüssel mit zwei Leerzeichen Einzug unter `jobs:`. */
export function jobsVon(yaml) {
  const teil = yaml.split(/^jobs:\s*$/m)[1] ?? "";
  return [...teil.matchAll(/^ {2}([\w-]+):\s*$/gm)].map((m) => m[1]);
}

/** Ist die Regel in irgendeinem Block von eslint.config.js eingeschaltet (nicht "off"/0)? */
function regelAn(config, regel) {
  return config.some((block) => {
    const w = block?.rules?.[regel];
    const stufe = Array.isArray(w) ? w[0] : w;
    return stufe !== undefined && stufe !== "off" && stufe !== 0;
  });
}

/**
 * Prüft einen Beleg gegen das Repo. Liefert null (aufgelöst), "github" (nur per Audit prüfbar)
 * oder eine Fehlermeldung.
 */
export function pruefeBeleg(beleg, eslintConfig) {
  const i = beleg.indexOf(":");
  const art = beleg.slice(0, i), wert = beleg.slice(i + 1);
  const [datei, name] = wert.split("#");
  switch (art) {
    case "datei": return gibt(wert) ? null : `Datei fehlt: ${wert}`;
    case "skript": return JSON.parse(lies("package.json")).scripts?.[wert] ? null : `npm-Skript fehlt: ${wert}`;
    case "job": {
      const pfad = `${WORKFLOWS}/${datei}`;
      if (!gibt(pfad)) return `Workflow fehlt: ${pfad}`;
      return jobsVon(lies(pfad)).includes(name) ? null : `Job ${name} fehlt in ${pfad}`;
    }
    case "pflicht": {
      const jobs = fs.readdirSync(path.join(WURZEL, WORKFLOWS)).filter((f) => /\.ya?ml$/.test(f))
        .flatMap((f) => jobsVon(lies(`${WORKFLOWS}/${f}`)));
      return jobs.includes(wert) ? null : `kein Workflow-Job heißt ${wert}`;
    }
    case "regel": return regelAn(eslintConfig, wert) ? null : `ESLint-Regel nicht eingeschaltet: ${wert}`;
    case "funktion": {
      if (!gibt(datei)) return `Datei fehlt: ${datei}`;
      const re = new RegExp(`^export\\s+(async\\s+)?(function\\*?|const|let|class)\\s+${name}\\b`, "m");
      return re.test(lies(datei)) ? null : `${datei} exportiert ${name} nicht`;
    }
    case "github": return "github";
    default: return `unbekannte Beleg-Art: ${beleg}`;
  }
}
