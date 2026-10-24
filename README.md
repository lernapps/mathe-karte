# Mathe-Karte

Prozentrechnung, binomische Formeln und Wahrscheinlichkeit für die Klassen 7 und 8, dazu eine Lehrplan-Karte:
<https://lernapps.github.io/mathe-karte/>. Teil von [lernapps.net](https://lernapps.net/).

Jede Seite erklärt eine Sache mit Regel, Beispiel und Bild und endet mit Übungsaufgaben, die sofort sagen, ob das
Ergebnis stimmt. Jede Seite ist ohne JavaScript lesbar, Text und Bild. Kein Server, kein Tracking, keine Anfrage an
fremde Server vor einem Klick.

Die Seiten sind ein _explainer_ von lernapps.net ([`@lernapps/app-templates`](https://github.com/lernapps/app-templates)):
Der Inhalt steht als YAML in [`src/`](src/), Übungen sind deklarierte `generated`-Aufgaben oder Vue-Komponenten in
[`src/components/`](src/components/). Die Lehrplan-Karte in [`karte/`](karte/) baut Eleventy. Warum, steht in
ADR-033 der [Architektur-Doku](https://lernapps.github.io/mathe-karte/docs/).

```bash
npm ci                 # Abhängigkeiten installieren (lernapps-Pakete von GitHub, auf einen Commit gepinnt)
npm test               # Unit-Tests (node:test und vp test)
npm run build          # dist/ bauen: explainer, dann die Karte; bricht bei Regelverstößen ab
npm run dev            # explainer lokal ansehen
npx lernapps check     # alle Prüfungen von lernapps.net samt Browser-Tests
```

Wie man eine Seite oder ein Kapitel anlegt, steht in [CLAUDE.md](CLAUDE.md) und im Inhaltsleitfaden
[`.agents/skills/app-content/`](.agents/skills/app-content/SKILL.md).

## Lizenz

[MIT](LICENSE), für den Code und die Texte in diesem Repo. Inhalte Dritter (z. B. Zitate aus Lehrplänen) behalten ihre eigene Lizenz.
