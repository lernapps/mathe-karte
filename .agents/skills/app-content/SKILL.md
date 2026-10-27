---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Hessen, Gymnasium (G9), Klassen 7 und 8; Kerncurriculum Mathematik Sekundarstufe I (Hessisches Kultusministerium,
  2021). Die Zuordnung je Bundesland steht in der Lehrplan-Karte (`karte/daten/zuordnungen/`), nicht hier.
- Prozentrechnung: Klasse 7 und 8; binomische Formeln: Klasse 8 (Einheit 8.1); Wahrscheinlichkeit: Klasse 7 und 8.

## Competencies

Je Seite eine Kompetenz, Datei `src/<kapitel>/<seite>.yaml`; die Knoten der Karte stehen in `karte/daten/kapitel.js`.

- Prozent (`src/prozent/`): Ich kann Grundwert, Prozentwert und Prozentsatz erkennen (`grundbegriffe`), den
  Prozentsatz (`prozentsatz`), den Prozentwert (`prozentwert`) und den Grundwert berechnen (`grundwert`), mit Zu- und
  Abnahme rechnen (`veraenderung`), zwei Werte prozentual vergleichen (`vergleich`), Sachaufgaben übersetzen
  (`sachaufgaben`).
- Binom (`src/binom/`): Ich kann zwei Klammern multiplizieren (`klammern-multiplizieren`), die erste, zweite und
  dritte binomische Formel anwenden (`erste-binomische`, `zweite-binomische`, `dritte-binomische`), rückwärts
  faktorisieren (`binome-rueckwaerts`) und damit im Kopf rechnen (`geschickt-rechnen`).
- Zufall (`src/zufall/`): Ich kann die Laplace-Formel anwenden (`laplace`), ein Baumdiagramm zeichnen
  (`baumdiagramm`), die erste und zweite Pfadregel anwenden (`pfadregel-1`, `pfadregel-2`), mit dem Gegenereignis
  rechnen (`gegenereignis`), ohne Zurücklegen rechnen (`ohne-zuruecklegen`), Wahrscheinlichkeiten als Produkt, Summe
  oder Potenz angeben (`ergebnisformen`) und Ereignisse in Pfade übersetzen (`pfade-uebersetzen`).

## Content structure

Jede Seite hat diese Abschnitte, in dieser Reihenfolge und mit diesen ids (öffentlicher Vertrag, nie umbenennen):

1. `warum` – „Warum?“: ein Absatz aus dem Alltag oder der Klassenarbeit, dann der Block `KarteVerweis` mit dem
   Knoten der Seite.
2. `regel` – „Regel“: `formula`-Blöcke, Fachbegriffe als `definition`, eine `note` „Merke“.
3. `beispiel` – „Beispiel“: eine `example`-Box mit `table` (gegeben, Rechnung, Ergebnis).
4. `bild` – „Bild“: das Beispielbild, ohne JavaScript sichtbar (siehe Figures).
5. `video` – „Video dazu“: ein `video`-Block (`youtube: <11 Zeichen nach watch?v=>`, `title` wie YouTube ihn zeigt,
   `channel: Lehrerschmidt`), danach der serlo-Link als Text, falls es einen geprüften gibt. Kein YouTube-Link im
   Text, kein Satz zu Kanal oder Datenschutz: das zeigt der Block selbst (`test/build/videos.test.js`).
6. `uebung` – „Übung“: die Übungen (siehe Exercise patterns).

`description` und `summary` sind reiner Text ohne `$…$` (`test/build/lektorat-texte.test.js`).

## Terminology

- Du-Anrede, kurze Sätze, Ton einer Lehrkraft, nicht der App („die App akzeptiert“ ist verboten). Kein „NICHT“ in
  Großbuchstaben, keine Verweise wie „Kompetenz 3“: ein Link mit Namen (`test/build/lektorat-texte.test.js`).
- Prozent: Grundwert $G$, Prozentwert $W$, Prozentsatz $p$ (mit „%“); Formeln $W = \frac{G \cdot p}{100}$ usw.
- Binom: „Glied“, „Mittelglied“, „Ausmultiplizieren“, „Faktorisieren“; Terme in der Eingabe mit `^` (`x^2+6x+9`).
- Zufall: $P(E)$, „günstige“ und „mögliche“ Ergebnisse, „Pfad“, „mit/ohne Zurücklegen“; Brüche gekürzt oder ungekürzt
  erlaubt.

## Exercise patterns

- Je Seite eine Übungskomponente mit „Bild zur Aufgabe“, Tipp, Rechenweg und den typischen Fehlern der alten App:
  - Prozent: `Prozent<Seite>` (z. B. `grundwert-aufgabe`, `ProzentGrundwert`), gemeinsame Logik in
    `ProzentKern.ts`/`ProzentAufgabe.ts`, Ansicht `ProzentUebung.vue`, Bild `ProzentBild.vue`. Rundungsregel:
    so viele Stellen wie verlangt oder mehr, Brüche und Terme wie `250*12/100` erlaubt.
  - Binom: `BinomTermAufgabe` mit Prop `art` (`klammern`, `erste`, `zweite`, `dritte`, `rueckwaerts`), Parser und
    Gleichwertigkeit in `BinomParser.ts`/`BinomTerm.ts`, Generatoren in `BinomFormeln.ts`; `BinomKopfrechnen` auf
    `geschickt-rechnen`.
  - Zufall: `ZufallLaplace`, `ZufallBaumLuecken`, `ZufallPfad`, `ZufallGegen`, `ZufallOhne`, `ZufallPfade`,
    `ZufallTerm`; Brüche in `ZufallBruch.ts`, Modelle in `ZufallModell.ts`, Bäume in `ZufallBaum.vue`.
- Dazu je Seite eine Übung, die keine Komponente ist (der explainer verlangt sie): Prozent und Zufall ein
  `generated`-Block (Zahl, `mistakes`, `hint`, `steps`), Binom eine `single-choice`-Frage zu einem typischen Fehler
  mit `info` je Option.
- Text und Optionen einer Quiz-Frage sind reiner Text ohne `$…$` (die Laufzeit-Tests vergleichen ungesetzten Text):
  Hochzahlen als `²`, Malpunkt `·`.

## Figures

- Hunderterfeld und Balken als `figure` mit `draw` (`hundred-grid`, `bar`).
- Was kein Block zeichnet (Flächenbild, Baum, Urne), zeichnet die Komponente der Übung; das Beispielbild entsteht
  daraus als SVG: Eintrag in `scripts/bilder.json`, dann `npm run bilder`, auf der Seite ein `figure` mit
  `image: images/<kapitel>-<seite>.svg`, `alt` aus dem `aria-label`, `caption` mit der genauen Beschreibung,
  `source: Eigene Darstellung der Mathe-Karte`, `licence: MIT`. Nie von Hand gezeichnete SVGs.
- Farben: Mathe-Blau `#1d4ed8`, Hervorhebung Orange `#ff8f00`; Kugeln rot/blau/gelb mit Buchstaben R/B/G.

## Sources

- Videos: Kanal Lehrerschmidt (YouTube), je Seite geprüft über oEmbed (`author_name` und Titel passen); als `video`-Block,
  der den Player erst nach dem Klick von youtube-nocookie.com lädt.
- serlo.org: Artikel mit numerischer id (`https://de.serlo.org/mathe/<id>/<slug>`), per curl geprüft (Status 200, der
  Artikel selbst, passt zur Kompetenz). Kein schwacher Treffer; dann kein Link.
- Texte und Aufgaben sind eigene Arbeit (MIT), übernommen aus den alten Apps des Repos.

## Adding a chapter or round

1. Kompetenzen als „Ich kann …“ hier eintragen; Seiten-ids festlegen (nie wieder ändern).
2. `src/<kapitel>/chapter.yaml` und je Seite die YAML-Datei mit den sechs Abschnitten; Kapitel in `src/app.yaml`.
3. Übungen nach den Mustern oben, Test zuerst (`src/components/<Name>.test.ts`).
4. Beispielbilder nach Figures; Eintrag in `karte/daten/kapitel.js` mit den Knoten.
5. `npm test`, `npm run build`, `npx lernapps check`; dann Commit und Pull Request.

## Rules learned from mistakes

- Formeln in `description` erschienen roh im Inhaltsverzeichnis → reiner Text.
- Formeln in Quiz-Fragen ließen die Laufzeit-Tests scheitern und hatten keinen zugänglichen Namen → reiner Text.
- Bilder als Komponente waren ohne JavaScript unsichtbar → statische SVGs aus `scripts/bilder.mjs`.
- Videos als Textlink mit Satz „Der Link öffnet YouTube …“ wiederholten, was die Runtime kann → `video`-Block.
- Ein wählbares Feld mit sichtbarem Text braucht diesen Text am Anfang seines Namens (axe
  label-content-name-mismatch).
