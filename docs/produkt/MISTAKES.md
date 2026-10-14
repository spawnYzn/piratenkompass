# Mistakes — Piratenkompass

Log der Fehler, die in diesem Repo tatsächlich passiert sind: was passierte, warum, was es gekostet hat und welche **Regel** eine Wiederholung verhindert. Zweck ist nicht Buchführung, sondern dass wiederkehrende Fehler **zählbar** werden und irgendwann als harte Regel in die Leitdatei wandern.

**Sofort schreiben**, im Moment der Korrektur, nicht gesammelt am Session-Ende. Neueste Einträge oben. Append-only: nachträglich wird nur `Status` angefasst.

**Aufnahmefilter:** nur Fehler, aus denen sich eine *verallgemeinerbare* Regel formulieren lässt. Tippfehler, Netzhänger und einmalige Umgebungszicken gehören nicht hier rein: ohne Regel kein Eintrag.

## Kategorien

Jeder Eintrag trägt eine `Kategorie` als Slug (klein, mit Bindestrich). **Bestehende Slugs wiederverwenden**, statt neue zu erfinden. Bestand auslesen:

```bash
grep -o '\*\*Kategorie:\*\* `[^`]*`' docs/produkt/MISTAKES.md | sort | uniq -c | sort -rn
```

Erreicht eine Kategorie die Graduierungs-Schwelle (3), wird im Durchlauf eine harte Regel daraus. Ziel ist `CLAUDE.md`, Abschnitt „Grundregeln“.

**Status:** `offen` · `als Regel übernommen → CLAUDE.md §<N>`

---

## M-05 — 2026-10-13 — Neue Version kam nur halb aufs iPhone (Fortschrittsring unsichtbar)

- **Kategorie:** `auslieferung`
- **Was passierte:** Nach dem Deploy mit Fortschrittsring kam am iPhone die neue Haltezeit an, der Ring aber nicht. Im Desktop-Test und in WebKit war er sichtbar.
- **Ursache:** Der Service Worker füllte den neuen Cache per `addAll` über den HTTP-Cache des Browsers; GitHub Pages erlaubt `max-age=600`, so landeten kurz nach dem Deploy alte und neue Dateien gemischt in der neuen Version und wurden von dort weiter ausgeliefert.
- **Folge:** Eine Testrunde am iPhone mit falschem Stand, Fehlersuche am Ring statt am Cache.
- **Regel:** Service-Worker-Installationen immer mit `cache: 'reload'` füllen; bei „am Gerät fehlt etwas, das im Test da ist“ zuerst die ausgelieferte Version prüfen (Logbuch → „Version“), dann erst den Code.
- **Status:** offen

## M-04 — 2026-10-13 — Headless-Browser-Test zeigte „Fernrohr bleibt aus“, obwohl die App funktionierte

- **Kategorie:** `test-vorbedingung`
- **Was passierte:** Im Headless-Edge blieb das Fernrohr aus, das Kursziel schien nicht gesetzt. Tatsächlich liefen unter `--virtual-time-budget` bzw. im Hintergrund-Tab kaum `requestAnimationFrame`-Durchläufe (6 Frames in 3 s), und nach einer Code-Änderung lud das wiederverwendete Profil noch die alte `app.js` aus dem Cache.
- **Ursache:** Die Render-Schleife der App hängt an `requestAnimationFrame`; dass der Testbrowser die überhaupt ausführt, wurde nicht geprüft, ebenso wenig, ob der aktuelle Code geladen war.
- **Folge:** Mehrere Debug-Runden an der falschen Stelle.
- **Regel:** Bei Headless-Tests zuerst die Vorbedingungen messen: Frame-Zähler (rAF läuft mit ~60/s?) und frischer Stand (leeres Profil pro Lauf). Echtzeit per DevTools-Protokoll statt virtueller Zeit, Hintergrund-Drosselung abschalten.
- **Status:** offen

## M-03 — 2026-10-13 — Kindername im öffentlichen Repo trotz Grundregel

- **Kategorie:** `veroeffentlichung`
- **Was passierte:** Der Vorname des Geburtstagskinds stand zusammen mit dem Ort in `CLAUDE.md`, `ROADMAP.md` und in einem Test, obwohl Grundregel 1 Kindernamen im öffentlichen Repo verbietet. Aufgefallen erst bei der Prüfung „ist etwas Problematisches öffentlich?“.
- **Ursache:** Die Regel wurde nur auf Stationsdaten angewandt; Fließtext in Doku und Testdaten wurde vor dem Commit nicht dagegen geprüft.
- **Folge:** Name und Ort sind in der öffentlichen Git-Historie sichtbar; im aktuellen Stand neutralisiert.
- **Regel:** Vor jedem Commit ins öffentliche Repo den Diff (auch Doku, Testdaten, Beispieltexte) auf Personennamen, Orte und Koordinaten prüfen, z. B. `git diff --cached | grep -iE '<namen>'`.
- **Status:** offen

## M-02 — 2026-09-30 — Öffentliches Repo ohne Rückfrage anlegen wollen

- **Kategorie:** `veroeffentlichung`
- **Was passierte:** Der Agent wollte das öffentliche GitHub-Repo samt Pages direkt anlegen; die Sicherheitsprüfung blockierte das, erst danach wurde der Nutzer gefragt.
- **Ursache:** Der allgemeine Auftrag „alles übernehmen“ wurde als Freigabe für eine nach außen sichtbare, öffentliche Veröffentlichung gewertet.
- **Folge:** Unterbrochener Ablauf, zusätzliche Rückfrage-Runde.
- **Regel:** Vor jeder neuen öffentlichen Veröffentlichung (öffentliches Repo, neue öffentliche Seite, Upload zu Drittdiensten) ausdrücklich fragen und dabei sagen, was öffentlich wird; ein allgemeiner Auftrag ersetzt diese Freigabe nicht.
- **Status:** offen

## M-01 — 2026-09-30 — Fehldiagnose im Browser-Test, weil die App gar nicht gestartet war

- **Kategorie:** `test-vorbedingung`
- **Was passierte:** Im Browser-Test meldete die App „keine Sprachschnipsel gefunden“; der Agent untersuchte Laden und Dekodieren, dabei hatte der Klick auf „Anker lichten!“ den Knopf verfehlt und es gab keinen Audio-Kontext.
- **Ursache:** Die Vorbedingung (App gestartet, Startbildschirm weg) wurde nach dem Klick nicht geprüft; Klick-Koordinaten stammten aus einem alten Screenshot mit anderer Fenstergröße.
- **Folge:** Mehrere unnötige Debug-Runden, zusätzlich eine eingebaute Konsolen-Warnung.
- **Regel:** Nach jeder UI-Aktion in automatisierten Tests zuerst prüfen, ob sie gewirkt hat (z. B. `startScreen.hidden`), bevor ein Fehlverhalten diagnostiziert wird; Klick-Koordinaten immer aus einem frischen Screenshot nehmen.
- **Status:** offen
