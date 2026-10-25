# Mathe-Karte

Prozentrechnung, binomische Formeln und Wahrscheinlichkeit für die Klassen 7 und 8, dazu eine Lehrplan-Karte:
<https://lernapps.net/mathe-karte/>. Teil von [lernapps.net](https://lernapps.net/).

Jede Seite erklärt eine Sache mit Regel, Beispiel und Bild und endet mit Übungsaufgaben, die sofort sagen, ob das
Ergebnis stimmt. Jede Seite ist ohne JavaScript lesbar, Text und Bild. Kein Server, kein Tracking, keine Anfrage an
fremde Server vor einem Klick.

Die Seiten sind ein _explainer_ von lernapps.net ([`@lernapps/app-templates`](https://github.com/lernapps/app-templates)):
Der Inhalt steht als YAML in [`src/`](src/), Übungen sind deklarierte `generated`-Aufgaben oder Vue-Komponenten in
[`src/components/`](src/components/). Die Lehrplan-Karte in [`karte/`](karte/) baut Eleventy.

```bash
npm ci                 # Abhängigkeiten installieren (lernapps-Pakete von GitHub, auf einen Commit gepinnt)
npm test               # Unit-Tests (vp test)
npm run build          # dist/ bauen: explainer, dann die Karte; bricht bei Regelverstößen ab
npm run dev            # explainer lokal ansehen
npx lernapps check     # alle Prüfungen von lernapps.net samt Browser-Tests
```

## Architektur

Die Mathe-Karte hat keine eigene Architektur mehr. Für jeden explainer gilt die gemeinsame Architektur von
lernapps.net: [arc42 des explainers](https://github.com/lernapps/app-templates/tree/main/explainer/docs/arc42) in
`lernapps/app-templates`, dazu die Regeln von [lernapps.net](https://lernapps.net/tooling/rules/). Die frühere
arc42-Doku dieses Repos beschrieb den eigenen Kern vor dem Umbau; sie ist gelöscht und steht in der Git-Historie.
Kürzel wie `QZ-3` oder `R-025` in Kommentaren und Tests stammen von dort.

Was über den explainer hinausgeht:

- **Lehrplan-Karte** (`karte/`): eine eigene Eleventy-Site unter `/karte/`, die Vite nach dem explainer baut
  (`karte/lib/vite-plugin.js`). Sie zeigt je Bundesland, welche Kompetenz wann dran ist, und verlinkt die Seiten.
- **Selbsteinschätzung**: Kinder schätzen je Seite ein, wie sicher sie sind. Das Modul soll bald Teil des explainers
  werden; bis dahin gibt es sie in dieser Site nicht.
- **Beispielbilder ohne JavaScript** (`scripts/bilder.mjs`): Was kein Block zeichnen kann, rendert dieselbe
  Vue-Komponente zur Build-Zeit als SVG.
- **Verweisseiten** (`lib/weiterleitungen.js`): Die Adressen der alten Apps (`/prozent/grundwert.html`) zeigen einen
  Link auf die neue Seite.

Geprüft und veröffentlicht wird mit dem Werkzeug von lernapps.net, wie bei jeder App aus dem Generator:
`.github/workflows/pages.yml` führt `lernapps check` bei jedem Push und Pull Request aus, stellt jeden Pull Request
als Vorschau unter `…/mathe-karte/pr-preview/pr-<Nummer>/` bereit und veröffentlicht `main` auf dem Branch `gh-pages`.

Wie man eine Seite oder ein Kapitel anlegt, steht in [CLAUDE.md](CLAUDE.md) und im Inhaltsleitfaden
[`.agents/skills/app-content/`](.agents/skills/app-content/SKILL.md).

## Lizenz

[MIT](LICENSE), für den Code und die Texte in diesem Repo. Inhalte Dritter (z. B. Zitate aus Lehrplänen) behalten ihre eigene Lizenz.
