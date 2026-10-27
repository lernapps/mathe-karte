# Mathe-Karte – instructions for AI agents

Read `AGENTS.md` first: it is the lernapps.net entry point (plans, skills, rules) and applies here unchanged.

The Mathe-Karte of lernapps.net: Prozentrechnung, binomische Formeln and Wahrscheinlichkeit for school years 7 and
8. It is a lernapps.net **explainer** as the generator writes it (`@lernapps/app-templates`, built with Vite+):
content is YAML in `src/`, exercises are `generated` blocks or Vue exercise components. Nothing goes beyond the
explainer: the curriculum map moves to the catalog (lernapps/apps#115). Deployed to GitHub Pages at
`https://lernapps.net/mathe-karte/`.

## Project rules
- Every page is fully readable without JavaScript – text AND picture. No external requests before a click; videos
  are the runtime's `video` block (`youtube`, `title`, `channel`): before a click it shows a link, the channel and a
  privacy note, and only the click loads the player from youtube-nocookie.com. Never a YouTube link in a text, never
  an own embed.
- Write only content: YAML in `src/`, components in `src/components/`. Never change the runtime in `node_modules`;
  fixes arrive with `lernapps update` in its own PR. Before writing content, load the skills `app-content`,
  `lernapps-explainer`, `lernapps-explainer-design` and `lernapps-content-questions`.
- German UI, `du`, German domain terms in identifiers, English for generic structure. Component names carry the
  chapter prefix (`Prozent…`, `Binom…`, `Zufall…`); shared code lives once in `src/components/Bruch.ts` (exact
  fractions and rounding) and `Zufallszahlen.ts` (mulberry32) – never copy them into a chapter.
- TDD; `npx vp test run` and `npm run build` green at every commit. Conventional Commits, add files by name (never
  `git add -A` / `git add .`), feature branches. The git hooks run `lernapps check`; never `--no-verify`.
- Page ids, section ids, exercise ids and the address `/<kapitel>/<seite>/?<übung>=<n>#<übung>` are a public contract
  used by the AI tutor. Never rename an id. The tutor rules live in `src/app.yaml` (`tutor.rules`).

## Example pictures
- What no block draws (section `bild`) the exercise component draws; its picture is a static SVG in
  `src/images/<kapitel>-<seite>.svg`, rendered from the component (`scripts/bilder.mjs`, in the history until
  `8b229e9`). The `<svg>` needs its `viewBox`. No hand-drawn SVGs.

## Build, test, deploy
- `npm ci`, `npx vp test run` (the components), `npm run build` (output `_site/`), `npm run dev`,
  `npx lernapps check` (format, lint, types, tests, build, the lernapps.net rules over `_site/`, end-to-end tests).
- `.github/workflows/pages.yml` from the lernapps.net generator: the app check on every push and PR, a preview of
  every PR at `<address>pr-preview/pr-<n>/`, and on `main` the publish to the `gh-pages` branch.

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
