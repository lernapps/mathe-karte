---
kompetenz: reste
beschreibung: 'Mathematik-Olympiade Klasse 8: Reste und Fallunterscheidung – mit Resten statt mit Zahlen rechnen, Fälle nach Resten, Einerziffern von Potenzen. Mit Rest-Uhr.'
warum: |
  <p>Viele Olympiade-Aufgaben sagen „für alle natürlichen Zahlen“. Du kannst nicht jede Zahl ausprobieren – aber jede Zahl lässt bei Division durch 3 nur den Rest 0, 1 oder 2. Drei Fälle statt unendlich vieler Zahlen: Das ist die Idee hinter der Fallunterscheidung nach Resten. Und wer mit Resten rechnet, findet Einerziffern riesiger Zahlen wie 7<sup>99</sup>, ohne sie auszurechnen.</p>
regel: |
  <ul>
  <li><strong>Rest aufschreiben:</strong> „x lässt bei Division durch m den Rest r“ heißt: x = m · q + r mit einer natürlichen Zahl q und 0 ≤ r &lt; m.</li>
  <li><strong>Mit Resten rechnen:</strong> Bei Summen und Produkten kommt es nur auf die Reste an. Der Teil, der ein Vielfaches von m ist, fällt weg.</li>
  <li><strong>Fallunterscheidung nach Resten:</strong> Jede ganze Zahl hat bei Division durch m genau einen der Reste 0, 1, …, m − 1. Behandelst du alle diese Fälle, hast du alle Zahlen erfasst.</li>
  <li><strong>Einerziffern:</strong> Die Einerziffer ist der Rest bei Division durch 10. Die Einerziffern von Potenzen wiederholen sich; finde die Periode.</li>
  </ul>
  <p class="merke">Merke: Ein Rest ist nie negativ und immer kleiner als der Teiler. 13 lässt bei Division durch 7 den Rest 6, nicht 13.</p>
beispiel: |
  <p>Eine natürliche Zahl x lässt bei Division durch 7 den Rest 4. Welchen Rest lässt 2 · x + 5 bei Division durch 7?</p>
  <table>
  <tbody>
  <tr><th scope="row">Ansatz</th><td>Weil x bei Division durch 7 den Rest 4 lässt, gibt es eine natürliche Zahl q mit x = 7 · q + 4.</td></tr>
  <tr><th scope="row">Umformen</th><td>2 · x + 5 = 14 · q + 8 + 5 = 7 · (2 · q) + 13.</td></tr>
  <tr><th scope="row">Begründung</th><td>7 · (2 · q) ist durch 7 teilbar. Also lässt 2 · x + 5 denselben Rest wie 13, und 13 = 7 · 1 + 6.</td></tr>
  <tr><th scope="row">Antwortsatz</th><td><strong>2 · x + 5 lässt bei Division durch 7 immer den Rest 6.</strong></td></tr>
  </tbody>
  </table>
  <p>Fallunterscheidung: Ist n eine ganze Zahl, dann ist n = 3q, 3q + 1 oder 3q + 2. Im ersten Fall ist n² = 3 · 3q², im zweiten n² = 3 · (3q² + 2q) + 1, im dritten n² = 3 · (3q² + 4q + 1) + 1. Also lässt eine Quadratzahl bei Division durch 3 nie den Rest 2.</p>
  <h3 id="mo-aufgaben">Offizielle Aufgaben zum Üben</h3>
  <p>Löse sie auf Papier, mit ganzer Begründung, und schick das Foto deinem Tutor:</p>
  <ul>
  <li><a href="https://www.mathematik-olympiaden.de/moev/index.php?option=com_download&amp;thema=a&amp;format=raw&amp;datei=A64081.pdf" rel="noopener">MO-Aufgabe 640814</a> (64. MO, 1. Runde, PDF): aus fünf Zahlen passende auswählen</li>
  </ul>
  <p class="quelle">Die Aufgaben gehören dem Mathematik-Olympiaden e.V.; der Link öffnet das Aufgabenblatt auf dessen Seite.</p>
bild:
  text: 'Die Rest-Uhr für die Division durch 7: Es gibt nur die Reste 0 bis 6. x steht beim Rest 4, 2 · x + 5 landet beim Rest 6.'
  funktion: zeichneRestuhr
  seed: 1
  geloest: true
  vorgaben:
    m: 7
---
