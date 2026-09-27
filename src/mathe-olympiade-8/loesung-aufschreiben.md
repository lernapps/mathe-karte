---
kompetenz: loesung-aufschreiben
beschreibung: 'Mathematik-Olympiade Klasse 8: Lösungen richtig aufschreiben – gegeben und gesucht, jeder Schritt mit Begründung, Probe und Vollständigkeit bei „Ermittle alle“, Fallunterscheidung, Antwortsatz.'
warum: |
  <p>In der Mathematik-Olympiade bekommst du für eine Zahl ohne Begründung kaum Punkte. Auf jedem Aufgabenblatt steht: Der Lösungsweg mit Begründungen und Nebenrechnungen soll deutlich erkennbar sein. Wer korrigiert, sieht nur dein Blatt – nicht, was du gedacht hast. Deshalb übst du hier, deine Gedanken so aufzuschreiben, dass jemand anderes jeden Schritt nachprüfen kann.</p>
regel: |
  <ol>
  <li><strong>Gegeben und gesucht.</strong> Schreib auf, was bekannt ist und was du finden sollst. Gib den Unbekannten Namen: „Es sei k die Anzahl der Kaninchen.“</li>
  <li><strong>Jeder Schritt mit „weil“.</strong> Jede Folgerung bekommt ihren Grund: „…, weil z höchstens 9 ist.“ Nebenrechnungen bleiben stehen.</li>
  <li><strong>Fallunterscheidung.</strong> Teilst du in Fälle, müssen sie zusammen alles abdecken. Dann behandelst du jeden Fall.</li>
  <li><strong>„Ermittle alle“ hat zwei Teile.</strong> Vollständigkeit: Wenn es eine Lösung gibt, dann nur diese – es gibt keine weiteren. Probe: Die gefundenen Zahlen erfüllen wirklich alle Bedingungen.</li>
  <li><strong>Antwortsatz.</strong> Zum Schluss ein ganzer Satz, der die Frage beantwortet.</li>
  </ol>
  <p class="merke">Merke: Eine Skizze zeigt dir eine Idee, sie beweist nichts. Was du aus ihr abliest, musst du begründen.</p>
beispiel: |
  <p>Ermittle alle zweistelligen Zahlen, die durch 9 teilbar sind und deren Zehnerziffer um 3 größer ist als ihre Einerziffer.</p>
  <table>
  <tbody>
  <tr><th scope="row">Gegeben, gesucht</th><td>Es seien z die Zehnerziffer und e die Einerziffer. Gegeben: z = e + 3, die Zahl ist durch 9 teilbar. Gesucht: alle solchen Zahlen.</td></tr>
  <tr><th scope="row">Schritt 1</th><td>Weil z höchstens 9 ist, ist e höchstens 6.</td></tr>
  <tr><th scope="row">Schritt 2</th><td>Eine Zahl ist genau dann durch 9 teilbar, wenn ihre Quersumme durch 9 teilbar ist. Die Quersumme ist z + e = 2e + 3.</td></tr>
  <tr><th scope="row">Schritt 3</th><td>Weil e zwischen 0 und 6 liegt, liegt 2e + 3 zwischen 3 und 15. Das einzige Vielfache von 9 dazwischen ist 9. Also ist 2e + 3 = 9, e = 3 und z = 6.</td></tr>
  <tr><th scope="row">Vollständigkeit</th><td>Wenn es eine solche Zahl gibt, dann ist es 63. Andere gibt es nicht.</td></tr>
  <tr><th scope="row">Probe</th><td>6 = 3 + 3 und 63 = 7 · 9.</td></tr>
  <tr><th scope="row">Antwortsatz</th><td><strong>Genau die Zahl 63 hat beide Eigenschaften.</strong></td></tr>
  </tbody>
  </table>
  <h3 id="mo-aufgaben">Offizielle Aufgaben zum Üben</h3>
  <p>Löse sie auf Papier, mit ganzer Begründung, und schick das Foto deinem Tutor:</p>
  <ul>
  <li><a href="https://www.mathematik-olympiaden.de/moev/index.php?option=com_download&amp;thema=a&amp;format=raw&amp;datei=A65082.pdf" rel="noopener">MO-Aufgabe 650821</a> (65. MO, 2. Runde, PDF): alle Anzahlen ermitteln</li>
  <li><a href="https://www.mathematik-olympiaden.de/moev/index.php?option=com_download&amp;thema=a&amp;format=raw&amp;datei=A64081.pdf" rel="noopener">MO-Aufgabe 640811</a> (64. MO, 1. Runde, PDF): zeigen, dass eine Zahl eindeutig bestimmt ist</li>
  <li><a href="https://www.mathematik-olympiaden.de/moev/index.php?option=com_download&amp;thema=a&amp;format=raw&amp;datei=A64081.pdf" rel="noopener">MO-Aufgabe 640813</a> (64. MO, 1. Runde, PDF): alle geordneten Paare ermitteln</li>
  </ul>
  <p class="quelle">Die Aufgaben gehören dem Mathematik-Olympiaden e.V.; der Link öffnet das Aufgabenblatt auf dessen Seite.</p>
bild:
  text: 'Die Fälle zur Übung „Hühner und Kaninchen, zusammen 18 Beine“: k = 0 bis 5 Kaninchen, h Hühner. k = 0 fällt weg (kein Kaninchen), k = 5 auch (h = −1). Übrig bleiben genau 4 Lösungen – und weil alle Fälle dastehen, fehlt keine.'
  funktion: zeichneFaelle
  seed: 1
  geloest: true
  uebung: 'Vor dem Prüfen stehen nur die Fälle da; danach zeigen ✓ und ✗, welche Lösungen sind.'
---
