# Sprecherskript für die Piratenstimme

Alle Dateien als **MP3** in diesen Ordner (`sounds/`) legen, Dateinamen genau so schreiben: klein, ohne Umlaute, ohne Leerzeichen.
Jede Datei ist optional: Was fehlt, wird einfach übersprungen. Gibt es mehrere Varianten (`-1`, `-2`, …), spielt die App jedes Mal zufällig eine davon.

## ElevenLabs-Tipps

- **Stimme:** In der Voice Library nach „Pirate“, „Old Sailor“ oder „Captain“ suchen, am besten eine raue, ältere, gutmütige Männerstimme. Das Modell **Eleven v3** oder **Multilingual v2** spricht Deutsch.
- **Einstellungen (Richtwerte):** Stability ca. 35–45 % (lebendiger), Similarity ca. 75 %, Style ca. 30–50 %.
- Bei Eleven v3 wirken Tags wie `[laughs]`, `[excited]`, `[whispers]` oder `[shouts]` am Satzanfang, einfach ausprobieren.
- Kurz halten: 2–8 Sekunden pro Schnipsel wirken am besten.
- Download als MP3 (44,1 kHz, 128 kbps reicht völlig).

## Allgemeine Schnipsel

| Datei | Wann | Vorschlag für den Text |
|---|---|---|
| `begruessung.mp3` | nach „Anker lichten!“, wenn der Deckel aufklappt | [laughs] Arrr! Ahoi, ihr Landratten! Der Zauberkompass ist erwacht. Folgt der goldenen Pfeilspitze, sie führt euch zum Schatz! Setzt die Segel! |
| `nah-1.mp3` | beim ersten Mal unter ca. 35 m vor einer Station | [excited] Arrr, ich kann es riechen! Wir sind ganz nah. Haltet die Augen offen! |
| `nah-2.mp3` | (Variante) | Heiß, heiß, heiß! Gleich haben wir es, Kameraden! |
| `nah-3.mp3` | (Variante) | [whispers] Pssst … Beim Klabautermann, hier irgendwo muss es sein! |
| `ankunft-1.mp3` | bei Ankunft an einer Zwischenstation | [shouts] Land in Sicht! Wir haben die Station erreicht! |
| `ankunft-2.mp3` | (Variante) | Arrr, gut gemacht, Mannschaft! Das ist die richtige Stelle! |
| `ankunft-3.mp3` | (Variante) | [laughs] Bei Neptuns Bart, ihr seid die besten Piraten der sieben Weltmeere! |
| `finale.mp3` | am letzten Ziel, wenn die Truhe aufgeht | [excited] Arrr! X markiert die Stelle! Genau hier, unter euren Füßen, liegt der Schatz vergraben. Schnappt euch die Schaufeln und grabt ihn aus, ihr Landratten! |

## Hinweise pro Station (optional)

Wird direkt nach dem Ankunfts-Schnipsel abgespielt. Die Nummer entspricht der Reihenfolge im Logbuch (Station 1, 2, 3 …).

| Datei | Beispiel |
|---|---|
| `station-1.mp3` | Sucht unter der roten Bank nach einer Flaschenpost. Darin steht, wohin die Reise weitergeht! |
| `station-2.mp3` | … |
| `station-3.mp3` | … |
| … | … |
| `station-N.mp3` (letzte Station) | Den Schlüssel für die Truhe hat der Käpt'n. Aber nur, wenn ihr laut „Arrr!“ ruft! |

Wichtig: Werden die Stationen im Logbuch umsortiert, passen die Nummern nicht mehr. Dann die Dateien umbenennen.

## Hinweis zur Veröffentlichung

Der Ordner liegt im **öffentlichen** GitHub-Repo. Wer den Link kennt, kann die Schnipsel anhören. Namen von Kindern oder genaue Orte deshalb besser nur allgemein halten.
