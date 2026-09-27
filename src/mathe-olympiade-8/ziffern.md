---
kompetenz: ziffern
beschreibung: 'Mathematik-Olympiade Klasse 8: Ziffern und Kryptogramme – Zahlen über ihre Ziffern schreiben, Quersummen zählen, Kryptogramme vollständig lösen.'
warum: |
  <p>Rätsel wie FUSS + BALL = CLUB sehen nach Probieren aus. Probieren findet aber höchstens einige Lösungen – die Olympiade fragt nach allen, oder danach, warum es keine gibt. Der Schlüssel: Schreib eine Zahl über ihre Ziffern, etwa 10 · a + b, und rechne damit. Dann siehst du, welche Ziffern überhaupt in Frage kommen, und kannst begründen, dass du keine Lösung übersehen hast.</p>
regel: |
  <ul>
  <li><strong>Stellenwert:</strong> Die Zahl mit den Ziffern a, b, c ist 100 · a + 10 · b + c. Die erste Ziffer ist nicht 0.</li>
  <li><strong>Kryptogramm:</strong> Gleiche Buchstaben stehen für gleiche Ziffern, verschiedene für verschiedene. Rechne spaltenweise von rechts; jeder Übertrag ist 0 oder 1 (bei zwei Summanden).</li>
  <li><strong>Grenzen:</strong> Schätz ab, wie groß eine Summe höchstens werden kann. Daraus folgt oft sofort eine Ziffer.</li>
  <li><strong>Zählen:</strong> Zähl Fall für Fall, etwa nach der ersten Ziffer, und prüf die Grenzen 0 und 9.</li>
  </ul>
  <p class="merke">Merke: Eine gefundene Lösung ist erst der halbe Weg. Du musst zeigen, dass es keine weiteren gibt.</p>
beispiel: |
  <p>Ermittle alle Lösungen des Kryptogramms AB + BA = CDC.</p>
  <table>
  <tbody>
  <tr><th scope="row">Umschreiben</th><td>AB + BA = (10A + B) + (10B + A) = 11 · (A + B).</td></tr>
  <tr><th scope="row">Grenzen</th><td>A + B ist höchstens 9 + 8 = 17, weil A und B verschieden sind. Also ist die Summe höchstens 187 und C = 1.</td></tr>
  <tr><th scope="row">Fälle</th><td>Weil A + B mindestens 10 ist (sonst wäre die Summe zweistellig), kommen 110, 121, 132, …, 187 in Frage. Nur 121 hat die Form 1D1. Also A + B = 11 und D = 2.</td></tr>
  <tr><th scope="row">Ziffern verschieden</th><td>A und B dürfen nicht 1 oder 2 sein. Mit A + B = 11 bleiben (3, 8), (4, 7), (5, 6), (6, 5), (7, 4), (8, 3); (2, 9) und (9, 2) fallen weg.</td></tr>
  <tr><th scope="row">Probe</th><td>38 + 83 = 121, 47 + 74 = 121, 56 + 65 = 121 und ebenso umgekehrt.</td></tr>
  <tr><th scope="row">Antwortsatz</th><td><strong>Das Kryptogramm hat genau 6 Lösungen.</strong></td></tr>
  </tbody>
  </table>
  <h3 id="mo-aufgaben">Offizielle Aufgaben zum Üben</h3>
  <p>Löse sie auf Papier, mit ganzer Begründung, und schick das Foto deinem Tutor:</p>
  <ul>
  <li><a href="https://www.mathematik-olympiaden.de/moev/index.php?option=com_download&amp;thema=a&amp;format=raw&amp;datei=A63082.pdf" rel="noopener">MO-Aufgabe 630821</a> (63. MO, 2. Runde, PDF): drei Kryptogramme</li>
  <li><a href="https://www.mathematik-olympiaden.de/moev/index.php?option=com_download&amp;thema=a&amp;format=raw&amp;datei=A64082.pdf" rel="noopener">MO-Aufgabe 640824</a> (64. MO, 2. Runde, PDF): Quersumme und Querprodukt</li>
  <li><a href="https://www.mathematik-olympiaden.de/moev/index.php?option=com_download&amp;thema=a&amp;format=raw&amp;datei=A64081.pdf" rel="noopener">MO-Aufgabe 640811</a> (64. MO, 1. Runde, PDF): ein Alter aus Ziffern-Bedingungen</li>
  </ul>
  <p class="quelle">Die Aufgaben gehören dem Mathematik-Olympiaden e.V.; der Link öffnet das Aufgabenblatt auf dessen Seite.</p>
---
