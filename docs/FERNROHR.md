# Fernrohr-Modus: Testanleitung & offene Punkte

An der Station **Wasserturm** wird der Kompass zum Fernrohr: Die Kinder stehen am Ausguck-Punkt, halten das iPhone quer und schauen sich um. Zeigt die Rückkamera in die eingemessene Richtung, wird das Bild scharf. Nach 1 s erscheint das Rätselbild mit dem Hinweis auf das Schlüssel-Versteck.

Technischer Hintergrund: `DECISION_MAP.md` B-11 bis B-13, Code in `fernrohr.js`.

**Stand:** 2026-10-13 · am Rechner getestet (Edge, simulierte Kamera), **auf dem iPhone noch nicht**.

---

## So funktioniert es (Kurzfassung)

| Was | Verhalten |
|---|---|
| Aktiv wenn | aktuelles Ziel hat „Wasserturm“ im Namen **und** Abstand < 10 m (wieder gesperrt ab 40 m) – oder die Station wurde per Notfall-Knopf / „Aktuelle Station als erreicht zählen“ als erreicht markiert |
| Quer / hochkant | erkannt über die Lage des Handys, funktioniert auch mit Ausrichtungssperre |
| Unschärfe | > 60° Abweichung voll, 60°–20° linear, < 20° scharf |
| Treffer | < 20° für 1 s → Ton, Haptik (falls iOS mitspielt), Rätselbild |
| Rätselbild | bleibt, bis das Handy wieder hochkant ist; danach neue Suche möglich |
| Ohne Kamera | schwarzer Grund mit Messingrand, ein Nebel zeigt die Nähe zur Richtung, Treffer funktioniert |
| Ohne Kompass | Hinweis „Kompass neu kalibrieren – Handy kurz flach halten“ |

Einstellungen im **Logbuch → „Fernrohr (Wasserturm)“**: gespeicherte Zielrichtung, Live-Anzeige *Kamera-Blick* vs. *Kompass*, Button zum Einmessen, Rätselbild wählen/entfernen.

---

## Testanleitung

### A. Zu Hause am iPhone (ohne zum Turm zu gehen)

Voraussetzung: App über https://spawnyzn.github.io/piratenkompass/ geöffnet (nach dem Update einmal ganz neu laden, ggf. Homescreen-App schließen und neu öffnen), „Anker lichten!“ getippt, Bewegung & Standort erlaubt.

1. **Kompass-Abgleich prüfen.** Logbuch öffnen → Abschnitt „Fernrohr (Wasserturm)“.
   - Handy **flach** halten: *Kamera-Blick* und *Kompass* müssen (fast) gleich sein.
   - Handy **hochkant aufrichten** (Kamera zeigt nach vorn): *Kamera-Blick* darf sich kaum ändern.
   - Weicht es deutlich ab (z. B. um 90° oder 180°), bitte Bescheid geben – dann stimmt die Annahme über die iOS-Winkel nicht.
2. **Fernrohr freischalten.** Bei Station 4 (Wasserturm) „Kurs setzen“, dann „Aktuelle Station als erreicht zählen“ (ersetzt die 10 m). Schriftrolle mit „Hier noch umschauen“ schließen.
3. **Einmessen.** Logbuch → „Aktuelle Richtung als Fernrohr-Ziel speichern“ → 3 s lang mit dem Fernrohr auf einen Gegenstand im Zimmer zielen. Danach öffnet sich das Logbuch wieder und zeigt den Wert in Grad. Beim ersten Mal fragt Safari nach der Kamera → erlauben.
4. **Suchen.** Logbuch schließen, Handy **quer und aufrecht** halten → Fernrohr fährt aus. Wegdrehen → verschwommen. Langsam auf den Gegenstand drehen → wird scharf, nach 1 s: Glocke, evtl. Haptik, Rätselbild.
5. **Beide Querrichtungen.** Einmal nach links, einmal nach rechts gedreht testen: Treffer muss in derselben Richtung kommen, Bild und Text müssen aufrecht stehen.
6. **Mit und ohne Ausrichtungssperre** (Kontrollzentrum) wiederholen.
7. **Hochkant** drehen → Kompass ist zurück. Wieder quer → neue Suche, Rätselbild zunächst weg.
8. **Anderes Ziel.** Bei einer anderen Station „Kurs setzen“, quer halten → **kein** Fernrohr (wie bisher „Bitte das Handy hochkant halten“).
9. **Ohne Kamera.** iPhone-Einstellungen → Apps → Safari → Kamera → „Ablehnen“, App neu laden, Schritte 2 und 4 wiederholen → schwarzer Grund mit Messingrand, Nebel lichtet sich beim Hindrehen, Treffer kommt trotzdem. Danach wieder auf „Fragen“/„Erlauben“ stellen.
10. **Rätselbild.** Logbuch → „Rätselbild wählen“ → Foto auswählen → Vorschau im Kreis prüfen, im Fernrohr per Treffer kontrollieren. Wichtiges in die Bildmitte, der Rand wird rund abgeschnitten.

### B. Vor Ort am Wasserturm (Generalprobe)

1. Station 4 als Ziel, zum Turm gehen: unter 10 m darf das Fernrohr beim Querhalten erscheinen, weiter weg nicht.
2. Genau auf den Ausguck-Punkt stellen, **Einmessen** (siehe A.3) und dabei aufs Versteck zielen. Turm, Zaun und Autos sind damit eingerechnet.
3. Ein paar Schritte vom Punkt weg und zurück, Suche wie ein Kind durchspielen. Ist es zu leicht/schwer, Rückmeldung geben (Korridor ±20° und 1 s sind einstellbar).
4. Spinnt das GPS am Turm (kein Fernrohr trotz Stehen am Punkt): Messingkappe in der Kompassmitte 2 s drücken – schaltet das Fernrohr frei.

### C. Am Rechner

```bash
python3 -m http.server 8765   # dann http://localhost:8765/?demo&quer
npm test                      # braucht Node (auf diesem Rechner nicht installiert)
```

Im Demo-Modus ist Station 2 der Demo-Wasserturm (Zielrichtung 90°), der Kompass dreht sich von selbst. Taste **Q** schaltet quer/hochkant. Kamera gibt es am Rechner meist keine → Fallback-Ansicht.

---

## Offene Punkte

| # | Punkt | Wer | Hinweis |
|---|---|---|---|
| 1 | Test A am iPhone durchführen, vor allem A.1 (Kompass-Abgleich) und A.5 (beide Querrichtungen) | Käpt'n | Ergebnis zurückmelden, falls etwas abweicht |
| 2 | Rätselbild erstellen und im Logbuch wählen | Käpt'n | bleibt nur auf dem Gerät; im Repo liegt nur `assets/ausguck_raetsel.png` als Platzhalter |
| 3 | Optional: `sounds/fernrohr.mp3` aufnehmen (z. B. „[shouts] Land in Sicht! Was seht ihr da im Fernrohr, Mannschaft?“) | Käpt'n | fehlt die Datei, läutet die Schiffsglocke; Skript in `sounds/SPRECHERTEXT.md` |
| 4 | Ankunfts-Hinweis der Station Wasserturm im Logbuch eintragen, z. B. „Haltet den Kompass quer wie ein Fernrohr!“ | Käpt'n | die Schriftrolle erscheint schon ab 15 m, das Fernrohr erst ab 10 m |
| 5 | Vor Ort einmessen (Test B.2) | Käpt'n | erst danach ist die Zielrichtung richtig |
| 6 | Haptik prüfen | Käpt'n | iPhone-Safari kann nicht vibrieren; der iOS-18-Trick wirkt evtl. nur nach einem Tippen. Ton und Bild kommen auf jeden Fall |
| 7 | Am Geburtstag: Kinder an der Schriftrolle erst nach dem Fernrohr auf „Kurs auf nächste Station“ tippen lassen | Käpt'n | sonst ist das Ziel schon weiter |
| 8 | Node installieren, damit `npm test` lokal läuft | optional | Tests liefen diesmal im Browser |
