# CLAUDE.md

Leitfaden für Claude Code (und andere Agenten) in diesem Repository.

## Was ist das hier

Der „Piratenkompass“: eine Web-App für die piratige Schatzsuche zu Henrys Geburtstag quer durch Kornburg. Sie zeigt einen Messing-Kompass im Vintage-Look und den Kurs zur nächsten Station; Zielgerät ist ein iPhone in Safari. Live unter https://spawnyzn.github.io/piratenkompass/ (GitHub Pages aus `main`). Überblick für Nutzer: `README.md`.

## Grundregeln

1. Das Repo ist **öffentlich**: keine Stationskoordinaten, keine Kindernamen, keine persönlichen Daten committen. Stationen leben nur im `localStorage` des Geräts (→ `DECISION_MAP.md` K-02).
2. Jeder Push auf `main` ist sofort ein Deploy. Vorher `npm test` laufen lassen und bei Code-Änderungen die `CACHE`-Version in `sw.js` erhöhen (→ B-10).
3. Kein Build-Schritt, kein Framework, keine npm-Abhängigkeiten: reines HTML/CSS/JS mit ES-Modulen (→ B-01). Externe Skripte nur von cdnjs (Leaflet wird bei Bedarf nachgeladen).
4. Oberfläche und Texte auf Deutsch, im Piratenton für Kinder.
5. Kompass und GPS funktionieren nur über HTTPS und auf einem echten Gerät; im Browser mit `?demo` testen und den Probelauf (Logbuch → Testen) nutzen.

> Hier landen später auch die aus `MISTAKES.md` graduierten Regeln, nummeriert und mit Rückverweis auf die `M-`IDs, die sie belegen.

## Struktur (Kurzfassung)

Siehe `docs/produkt/ARCHITECTURE.md` für die annotierte Repo-Karte.

## Konventionen

- **Sprachschnipsel:** MP3 in `sounds/`, Namensschema laut `sounds/SPRECHERTEXT.md` (klein, ohne Umlaute).
- **Commits:** deutsch, knapp; Tracking-Commits mit Präfix `chore(tracking): Schmetterling <Datum>`.

## Lokales Ausführen / Tests

```bash
python3 -m http.server 8765   # dann http://localhost:8765/?demo
npm test                      # Tests für geo.js
```

## Projekt-Tracking (Schmetterling)

Dieses Repo nutzt den Schmetterling-Tracking-Workflow. Sechs lebende Dokumente unter `docs/produkt/`:

| Dokument | Rolle |
|---|---|
| `ROADMAP.md` | Was in welcher Reihenfolge |
| `HISTORY.md` | Was je Session erreicht wurde |
| `DECISION_MAP.md` | Warum so gebaut wird (tragende Entscheidungen) |
| `ARCHITECTURE.md` | Wo liegt was im Repo (Ist-Struktur) |
| `TASKS.md` | Offene / erledigte Aufgaben |
| `MISTAKES.md` | Was schiefging: Fehler, Ursache, Verhinderungsregel |

Sagt der Nutzer **„Schmetterling“** (Session-Ende), wird ein kompletter Aktualisierungs-Durchlauf über diese Dokumente gemacht. Zu Session-Beginn dienen sie der Orientierung. Ablauf und Regeln kommen aus dem `schmetterling`-Skill.

### Fehler-Log (laufend)

Geht etwas kaputt oder wird ein eingeschlagener Weg korrigiert: **sofort** einen Eintrag oben in `docs/produkt/MISTAKES.md` anlegen (Kategorie / was passierte / Ursache / Folge / Regel). Nur was eine verallgemeinerbare Regel hergibt; nicht bis zum Session-Ende sammeln. Bestehende Kategorie-Slugs wiederverwenden. Vor Arbeit an einem Bereich mit bekannter Fehlerhistorie dort per `grep` nachsehen.

Häufen sich Einträge derselben Kategorie, wird im nächsten Durchlauf eine harte Regel daraus. Sie landet unter „Grundregeln“ in dieser Datei.
