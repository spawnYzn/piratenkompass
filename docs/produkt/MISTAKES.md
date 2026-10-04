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
