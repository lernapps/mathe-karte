# Mathe-Karte – instructions for AI agents

The Mathe-Karte of lernapps.net: Prozentrechnung, binomische Formeln and Wahrscheinlichkeit for school years 7 and
8, plus the curriculum map. Since ADR-033 the pages are a lernapps.net **explainer** (`@lernapps/app-templates`,
built with Vite+): content is YAML in `src/`, exercises are `generated` blocks or Vue exercise components. Only the
curriculum map (`karte/`) is still built with Eleventy 3.1.7. Deployed to GitHub Pages at
`https://lernapps.github.io/mathe-karte/`. The old single-app repos (`raifdmueller.github.io/*-trainer`,
`lern-app-template`) were deleted on 23.09.2026: never link to them or rely on them.

## Project rules
- Output is static HTML. Every page is fully readable without JavaScript – text AND picture. The explainer renders
  it; JS only powers exercises and components.
- No external requests before a click. Videos are plain links (`https://www.youtube.com/watch?v=…`), no embeds. No
  CDN, no web fonts, no analytics, no cookies. The explainer stores only the learner's tutor provider (through
  `@lernapps/tooling/storage`); the map stores nothing.
- Write only content: YAML in `src/`, components in `src/components/`. Never change the runtime in `node_modules`
  (rule `explainer-only-content`); fixes arrive with `lernapps update` in its own PR.
- Before writing content, read in full from the files: `node_modules/@lernapps/tooling/skills/archetypes/
  lernapps-explainer/SKILL.md` and its `references/`, `lernapps-explainer-design`, `lernapps-content-questions`.
  Schema: `node_modules/@lernapps/app-templates/runtime/explainer/explainer.v1.schema.json`.
- The lernapps packages are pinned to a commit in `package.json`; Eleventy is pinned exactly. Mature libraries only.
- Mobile-first (360 px), WCAG 2.2 AA, `lang="de"`, German UI, German domain terms in identifiers (Ubiquitous
  Language), English for generic structure. Component names carry the chapter prefix (`Prozent…`, `Binom…`,
  `Zufall…`).
- Every file under 500 lines (the build fails otherwise). SOLID, DRY, KISS.
- TDD: write the test first, see it fail, implement, see it pass. `npm test` and `npm run build` green at every commit.
  Conventional Commits, small steps, add files by name (never `git add -A` / `git add .`), feature branches. The git
  hooks of lernapps.net run `lernapps check --pre-commit` / `--pre-push`; never `--no-verify`.
- Page ids, section ids, exercise ids and the address `/<kapitel>/<seite>/?<übung>=<n>#<übung>` are a public contract
  used by the AI tutor (the explainer writes `llms.txt`, `tutor.md` per page and the tutor prompt from the content).
  Never rename an id; moving a page means changing `karte/daten/kapitel.js` in the same PR.
- Verify UI changes in a browser before reporting them done: `npx lernapps check` runs the explainer's end-to-end
  tests and ours (`e2e/*.spec.js`: axe, no external request, 360 px, without JS) over every page incl. the map.

## Layout of the repository
- `src/` – the explainer, nothing else (the runtime refuses other files): `app.yaml` (title, intro, chapters),
  `<kapitel>/chapter.yaml` (title, summary, order of pages), `<kapitel>/<seite>.yaml` (sections `warum`, `regel`,
  `beispiel`, `bild`, `video`, `uebung`), `components/<Name>.vue` + `<Name>.ts` + `<Name>.test.ts`, `main.ts`.
- `karte/` – the curriculum map at `/karte/` (Eleventy input: pages `*.njk`, `_data/site.js`, `_includes/`, `js/`,
  `css/`, `schemas/`, `daten/`, `lib/`, `test/`). `karte/_data/site.js` is THE one place holding the base URL;
  `lib/adressen.js` derives the rest. Curriculum data as flat-front-matter Markdown in `karte/daten/` (model in
  `karte/daten/README.md`). The chapters appear on the map through `karte/daten/kapitel.js` (entry fields
  `aktiv-level`, `backend`, `external-requests`, `dsgvo`, `evidence`, `jahrgaenge`, `lizenz`, `stand`; per page its
  node ids); `karte/lib/kapitel.js` fails the build if a page does not exist. Unknown node ids fail the build. Apps
  outside the repo: `karte/daten/externe-eintraege.js`. URL parameters `land`, `jahrgang`, `leitidee`, `luecken`,
  `knoten` and the shape of `data.json` are a public contract (`karte/llms.njk`).
- `vite.config.ts` – explainer plugin plus `karte()` (`karte/lib/vite-plugin.js`), which runs Eleventy
  (`eleventy.config.js`) after the explainer and then checks the whole `dist/`.
- `lib/` – build-time Node code shared by the checks: `adressen.js`, `fachfarben.js`, `pruefungen.js`,
  `pruefe-ausgabe.js`, `pruefe-links.js`, `pruefe-lizenzen.js`, `versionierung.js`.
- `public/` – favicons, copied to the root of `dist/`.
- `test/build/`, `karte/test/` (node:test), `src/components/*.test.ts` (`vp test`), `e2e/` (Playwright).
- `docs/` – architecture docs (see "Architecture"); `werkzeuge/review/` – the AI review checklist.
- `AGENTS.md`, `.agents/skills/app-content/`, `.vibe/plans/` – written by the lernapps.net generator.

## Build rules (enforced by `npm run build`, `npm test` and `lernapps check`)
- The required check `test-und-build` (`pruefen.yml`) runs `npm run audit` (high/critical fail; exceptions only with
  reason and expiry date in `scripts/audit.js`), `npm run lint` (ESLint for the JavaScript part: `no-eval`,
  `no-implied-eval`, `no-unsanitized`), `npm run typecheck` (`vp check`: format, lint with the lernapps.net rules,
  type-aware; `vue-tsc --noEmit`), `npm test`, `npm run build`. The required check `browser` runs `lernapps check`.
- The explainer validates every YAML file against its schema and fails with `file:line: place: what to do`; it
  property-tests every `generated` exercise over 200 seeds and every exercise component over 50; it checks every
  internal link and anchor, also in `llms.txt` and `tutor.md`.
- Pictures: the example picture of a page (section `bild`) must show without JavaScript. When a block (`figure`
  with `draw`) cannot draw it, the component that draws the exercise picture draws it too: list it in
  `scripts/bilder.json` and run `npm run bilder` (Vue SSR → `src/images/<kapitel>-<seite>.svg`, shown as a `figure`
  block). `node scripts/bilder.mjs --uebernehmen` converts a `vue-component` under `bild` once; `npm test` fails when
  a file differs from what its component draws. No hand-drawn SVGs.
- Components: no network, no `innerHTML`/`v-html`/`eval`, browser globals only once mounted, imports only from
  `vue`, the lernapps packages and `src/components/`, max 20 kB gzip (lint plugin of lernapps.net).
- Licences (`lib/pruefe-lizenzen.js`, run by `npm test`): every package in `package-lock.json` needs a licence from the
  allowlist (shipped packages permissive only; dev packages also MPL-2.0), every file under `**/vendor/` a licence
  header. Changing the allowlist needs an ADR (ADR-029). `abhaengigkeiten.yml` runs Dependency Review on every PR
  (required check `abhaengigkeiten`).
- After the explainer, `eleventy.config.js` checks all of `dist/`: no external resources in HTML, no external imports
  in JS/CSS, every source file under 500 lines, no dead internal links or anchors (`lib/pruefe-links.js`; `docs/` is
  skipped), the report link on every map page.
- Tutor link allowlist (ADR-023, `pruefeTutorLinks`): every `llms.txt` and `tutor.md` in `dist/` may link only to
  relative targets, `https://lernapps.github.io/mathe-karte/`, `/blob/main/` and `/tree/main/` of the own repository,
  `https://de.serlo.org/` and `https://www.youtube.com/watch?v=`. Any other URL fails the build. These files are
  prompts in a child's chat; widen the allowlist only with an ADR.
- Map only: the build appends `?v=<hash>` to every local import, script and stylesheet of the map; the explainer's
  assets carry their hash in the file name. Bump the version in `package.json` (SemVer) on user-visible changes.

## New page in an existing chapter
1. Read the explainer skill and its references (see Project rules).
2. Write `src/<kapitel>/<seite>.yaml` and list it in `chapter.yaml`. Every page needs an exercise in a last section
   `uebung`: a `generated` block with `mistakes`, `hint` and `steps`, or a quiz question, or an exercise component
   (test first: `src/components/<Name>.test.ts`, then `<Name>.ts` and `<Name>.vue`).
3. Add the page with its node ids to `karte/daten/kapitel.js`.
4. `npm test && npm run build`, then `npx lernapps check`.

## New chapter
A folder `src/<kapitel>/` with `chapter.yaml`, listed in `src/app.yaml`, and an entry in `karte/daten/kapitel.js`
(`id` names it on the map and in `data.json`: never change it).

## Build, test, deploy
- `npm ci`, `npm test`, `npm run build` (output `dist/`), `npm run dev` (explainer only), `npx lernapps check`.
- Browser tests locally: `npm run build && npm run test:browser`; where Playwright's own Chromium is missing set
  `LERNAPPS_CHROMIUM` to an installed Chromium (`lernapps check` does that itself).
- `.github/workflows/pruefen.yml` and `browser.yml` on every push and PR. `.github/workflows/pages.yml`: on push to
  `main`, test + build, then the arc42 docs (`scripts/dtc-v4.sh generateSite`) into `dist/docs/`, deployed as ONE
  artifact via `actions/upload-pages-artifact` + `actions/deploy-pages`.

## AI review before every merge (#24, ADR-027)
- Before a PR is proposed for merge, a reviewer in a FRESH context (sub-agent or new session, not the author;
  ideally another model) runs `werkzeuge/review/ki-review.md`: Fagan-style checklist (correctness, tests trace to
  the issue, OWASP incl. `innerHTML`/`eval`/external requests/tutor-link allowlist, static first, privacy, teacher
  voice and maths, ADR/docs/version). The author never writes the verdict.
- The reviewer posts a PR review (type comment) starting with `## KI-Review`, with the lines `Stand: <head SHA>` and
  `Ergebnis: freigegeben` or `Ergebnis: Änderungen nötig`, and the findings. Unfixed findings get a reason in the PR.
- The check `ki-review` (`.github/workflows/ki-review.yml`, read-only token, no LLM call) is green only if the newest
  such review from an account with admin permission on the repo (the
  owners of the lernapps organisation, or an admin of this repo) came after the last commit and names the head SHA. Every new commit needs a new review.
- Architecture review (ADR-030): if a PR touches ADR bodies (`docs/arc42/chapters/_adr-*.adoc`), the dated ATAM reports
  (`_atam-*.adoc`) or arc42 chapter 1, 4, 5, 9 or 10 (`ARCHITEKTUR_PFADE` in `scripts/ki-review-pruefen.js`), the review needs a section
  `### Architektur (ATAM)` evaluating the change against the utility tree (chapter 10) and the newest ATAM report
  (appendix „Bewertungen“); without it `ki-review` stays red. Repeat ATAM, security review and harness audit quarterly.
- Dated assessments (ATAM, security review, harness audit) are snapshots: they live in the appendix
  `13_bewertungen.adoc`, one dated section per quarter, one file per report (`_atam-JJJJ-MM-TT.adoc`,
  `_security-…`, `_harness-audit-…`); never edit an old report. Results flow into chapters 8, 10 and 11.
- Inside Herdr (`HERDR_ENV=1`) the reviewer runs as its own named Herdr Claude session (`review: PR #<n>`), not as an
  invisible sub-agent.

## Architecture
- arc42 documentation (German) lives in `docs/arc42/` (chapters in `chapters/`, ADRs in `chapters/_adr-*.adoc`,
  index in chapter 9); theme overrides without CDN resources in `docs/site/`; config `docToolchainConfig.groovy`.
  Eleventy ignores `docs/` and `docs/site/`. Live at `https://lernapps.github.io/docs/`.
- Overview page `docs/uebersicht/` (ADR-031): `scripts/dtc-v4.sh` first runs `node scripts/dashboard.js`, which
  writes key figures, risk matrix, utility tree and risk themes into git-ignored `docs/uebersicht/_*.adoc`. Never
  commit them; if you change the format of the chapter 11 risk table, the chapter 9 index or the utility tree, keep
  `test/build/dashboard.test.js` green. It runs the unit tests once and `playwright test --list` (needs `npm ci` and a
  built `_site/`), so run `npm run build` before `scripts/dtc-v4.sh`.
- Build locally: `scripts/dtc-v4.sh generateSite` (docToolchain v4 pinned to `main-4.x@6de96fb7`, needs Java 17 and
  Graphviz; first run clones and builds docToolchain). Output: `build/microsite/output/` (git-ignored). Check nav,
  chapter pages, rendered diagrams and links there before pushing.
- Every decision about the kern, the layout, the build, deployment or a new dependency needs an ADR in chapter 9
  (Nygard, Pugh matrix against QZ-1…QZ-5, consequences naming risk IDs from chapter 11). Superseded ADRs stay in the
  index with status "Superseded by ADR-0xx". Diagrams: PlantUML with `!include <C4/...>`, never a URL.
- Inter-page links: `xref:NN_file.adoc#anchor[]`, never `link:foo.adoc[]`.
- `doku.yml` lints `docs` with asciidoc-linter pinned to a commit SHA (ADR-028) via `scripts/doku-lint.js`: ERRORs
  fail the job, WARNINGs don't. Pinned SHA: `911440ac35d5849349389cce7ba04311d75dca49` (after upstream #62). Locally: `pip install git+https://github.com/docToolchain/asciidoc-linter@<SHA>` in a
  venv, then `node scripts/doku-lint.js`.

## Risk Radar Assessment

_Assessed on 2026-09-24 against the Vibe-Coding Risk Radar (https://llm-coding.github.io/vibe-coding-risk-radar/), confirmed by the Product Owner_
_Architecture Decision: See [ADR-023](docs/arc42/chapters/_adr-risiko.adoc) (arc42 chapter 9)_

### Module: lernapps.github.io

**LLM Runtime Integration:** L0 (No LLM) — no LLM SDK in the code; the external claude.ai tutor (loads `tutor.md`) is effectively L2 (Generate) but runs outside the repo and does not raise the tier

| Dimension        | Score | Level                  | Evidence                                                                 |
| ---------------- | ----- | ---------------------- | ------------------------------------------------------------------------ |
| Code Type        | 2     | Business Logic         | exercise generators and checkers (YAML `generated`, Vue components in `src/components/`) |
| Language         | 2     | Dynamically typed      | TypeScript in `src/components/`, JavaScript for the map and the checks   |
| Deployment       | 2     | Public-facing app      | user input: public GitHub Pages site, no accounts, no personal data      |
| Data Sensitivity | 0     | Public data            | user input: no data storage; localStorage holds only self-assessment levels |
| Blast Radius     | 1     | Performance / DoS      | user input: a broken app is unavailable or wrong, no data loss           |

**Tier: 2 — Moderate** (determined by Code Type = 2, Language = 2, Deployment = 2)

Known model gap: educational harm (wrong feedback silently teaches a child something wrong; R-025), mitigated by
property-based tests. Special risk: `tutor.md` is a prompt in a child's chat session (T-015, R-024), mitigated by
branch protection, secret scanning with push protection, org-wide 2FA and the tutor link allowlist in the build.

### Mitigations: lernapps.github.io (Tier 2)

| Measure                | Status  | Details                                                                        |
| ---------------------- | ------- | ------------------------------------------------------------------------------ |
| Linter & Formatter     | Present | ESLint for the JavaScript part (#21), `vp check` (oxlint + lernapps.net rules, `vp fmt`) for `src/` |
| Type Checking          | Present | `vp check` (type-aware) and `vue-tsc` in required check, scope `src/` (#25, ADR-033) |
| Pre-Commit Hooks       | N/A     | Won't (#27): the required check runs the same gates                             |
| Dependency Check       | Present | `npm run audit` in `pruefen.yml` (#20, exceptions with expiry, ADR-033); pins, `npm ci` |
| CI Build & Unit Tests  | Present | `pruefen.yml`, required check `test-und-build`                                  |
| SAST                   | Present | CodeQL default setup, secret scanning with push protection, Dependabot (#19)    |
| AI Code Review         | Present | fresh-context review before every merge, check `ki-review` (#24, ADR-027)       |
| AI Design Review       | Present | ATAM section in the review when ADRs or arc42 ch. 1/4/5/9/10 change, enforced by `ki-review`; quarterly ATAM baseline (ADR-030) |
| Property-Based Tests   | Present | explainer build: 200 seeds per `generated` exercise, 50 per component (ADR-033)  |
| Browser Tests          | Present | `lernapps check` with Playwright + axe-core (`e2e/`), workflow `browser.yml`, required check `browser` (#26, ADR-026, ADR-033) |
| SonarQube Quality Gate | N/A     | Won't (#28): file length ≤ 500 lines and ESLint cover it                        |
| Sampling Review (~20%) | Present | 100 %: the PO merges every PR; a human approval is not enforceable (a single maintainer cannot approve their own PR), but the required check `ki-review` enforces a fresh-context review on every PR (ADR-027) |
| Tutor link allowlist   | Present | `pruefeTutorLinks` in `lib/pruefungen.js` (ADR-023, M-22)                       |
| Org 2FA requirement    | Present | decided and enabled 2026-09-24 (R-017, M-21)                                    |
| License compliance     | Present | `lib/pruefe-lizenzen.js` in `npm test`; Dependency Review in `abhaengigkeiten.yml`, required check `abhaengigkeiten` (ADR-029, M-24) |
| Security review        | Present | full OWASP baseline 25.09.2026 (arc42 appendix „Bewertungen“, `_security-2026-09-25.adoc`), repeated quarterly with ATAM and the harness audit |

## Semantic Contracts
Source: https://llm-coding.github.io/Semantic-Anchors/contracts/ — copied from lern-app-template so the repo is self-contained.

### Code Quality
Our code follows:
- SOLID principles
- DRY, KISS
- Ubiquitous Language from Domain-Driven Design (same terms in code as in the specification)

### Implement Next
For each issue:
- Create a feature branch for the EPIC
- Select next issue from backlog (respect dependencies)
- Analyze and document analysis as a comment on the issue
- Implement using TDD (London or Chicago School as appropriate)
- Each test references its Use Case ID for traceability
- Commit with Conventional Commits, reference issue number
- Check if spec or architecture docs need updating
- When EPIC is complete, create a Pull Request

### Vertical Slicing
Build the first increment as a walking skeleton: a deployable end-to-end slice that wires every architectural layer together and does almost nothing else.

Grow the system as thin vertical slices — each slice cuts through all layers and delivers one small piece of user value. Slices are tracer bullets: kept and refined, never thrown away.

When a technical unknown blocks a slice, run a spike solution first — a timeboxed, throwaway experiment that removes the risk. Spike code is discarded; only its lesson carries into the slice.

### Writing Style
Writing follows Gutes Deutsch nach Wolf Schneider (or Plain English according to Strunk & White).

Additionally:
- Technical terms stay in English (LLM, Prompt, Token, Spec, etc.)
- Address the reader directly, use first person sparingly but deliberately
- Use analogies to human thinking to explain technical concepts
- One thought per paragraph (5-8 sentences is fine)
- Section headings are statements, not topic announcements
- First sentence says what the paragraph is about
- Show code and prompts, don't just claim things work
- Conclusions make a clear statement — never end with 'it remains exciting'

### Concise Response (TLDR)
Responses lead with the conclusion first (BLUF). Keep to essential points. No filler, no preamble. Use short sentences, active voice, and no unnecessary words (Strunk & White).
