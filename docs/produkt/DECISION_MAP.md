# Decision Map — Piratenkompass

Karte **aller tragenden Entscheidungen** über den Projektverlauf, mit Status, Datum und Quelle. Inhalte werden **nicht dupliziert**, sondern verlinkt. Gepflegt im **Schmetterling**-Durchlauf.

Status: **Akzeptiert** · **Abgelöst** · **Offen**.

## Fachliche Setzungen (K-Punkte)

| ID | Datum | Entscheidung | Status | Quelle |
|---|---|---|---|---|
| K-01 | 2026-09-30 | Zielgerät ist das iPhone (15 Pro Max) in Safari; Web-App statt nativer App, Auslieferung zwingend über HTTPS (sonst kein Kompass/GPS) | Akzeptiert | Session 2026-09-30 |
| K-02 | 2026-09-30 | Stationen, Titel und Einstellungen liegen nur lokal im Browser (`localStorage`), nie im öffentlichen Repo; Übertragung auf andere Geräte per Link-Hash | Akzeptiert | `geo.js` (`encodeHunt`), `README.md` |
| K-03 | 2026-09-30 | Die Schatztruhe hat ein Schlüssel-Schloss, deshalb keine Code-Ziffern-Mechanik | Akzeptiert | Nutzer, Session 2026-09-30 |
| K-04 | 2026-09-30 | Es gibt eine physische Schatzkarte, deshalb keine digitale Karten- oder Fortschrittsansicht | Akzeptiert | Nutzer, Session 2026-09-30 |
| K-05 | 2026-09-30 | Gespielt wird bei Tag, deshalb kein Nachtmodus | Akzeptiert | Nutzer, Session 2026-09-30 |

## Prozess / Meta

| ID | Datum | Entscheidung | Status | Quelle |
|---|---|---|---|---|
| P-01 | 2026-10-04 | Sechs lebende PM-Artefakte (Roadmap, History, Decision Map, Architecture, Tasks, Mistakes) + „Schmetterling“-Durchlauf nach jeder Session; Fehler-Log laufend, Graduierung ab 3 gleichartigen Einträgen | Akzeptiert | `CLAUDE.md` |

## Bau- / Design-Entscheidungen

| ID | Datum | Entscheidung | Status | Quelle |
|---|---|---|---|---|
| B-01 | 2026-09-30 | Reines HTML/CSS/JS mit ES-Modulen, kein Build-Schritt; Hosting über GitHub Pages (`spawnYzn/piratenkompass`, öffentlich, vom Nutzer freigegeben), jeder Push auf `main` ist ein Deploy | Akzeptiert | `README.md` |
| B-02 | 2026-09-30 | Kartenkompass: die Windrose dreht sich, der Zielpfeil folgt als gedämpfte Feder relativ zur angezeigten Rose (damit Pfeil und X-Markierung deckungsgleich bleiben) | Akzeptiert | `app.js` (`frame`) |
| B-03 | 2026-09-30 | Kinderschutz: Logbuch nur per Langdruck auf den Anker; Notfall-Ankunft geheim per 2-s-Druck auf die Messingkappe, ohne sichtbares Feedback | Akzeptiert | `app.js` |
| B-04 | 2026-09-30 | Heiß-und-kalt-Modus ab max(35 m, 2,5 × Ankunftsradius), weil das GPS auf den letzten Metern ungenau ist | Akzeptiert | `app.js` (`updateText`) |
| B-05 | 2026-09-30 | Glocke, Sonar, Kanone, Meeresrauschen und Möwen werden per WebAudio synthetisiert (keine Dateien); `navigator.audioSession` auf `playback`, damit der Ton trotz Lautlos-Schalter läuft | Akzeptiert | `audio.js` |
| B-06 | 2026-09-30 | Piratenstimme über die Sprachausgabe des Geräts | Abgelöst → B-07 | Session 2026-09-30 |
| B-07 | 2026-09-30 | Piratenstimme als vorbereitete ElevenLabs-MP3s in `sounds/` mit festem Namensschema (Varianten zufällig, fehlende Dateien werden übersprungen); Computerstimme klang für den Nutzer schrecklich | Akzeptiert | `sounds/SPRECHERTEXT.md` |
| B-08 | 2026-09-30 | Schatztruhen-Animation nur im Finale (Ausgraben im Sandkasten), Zwischenstationen behalten die Schriftrolle | Akzeptiert | Nutzer, Session 2026-09-30 |
| B-09 | 2026-09-30 | Probelauf simuliert den Anlauf aus 70 m (2 m/s) mit echtem Kompass; der Spielfortschritt wird danach zurückgesetzt | Akzeptiert | `app.js` (`startSim`) |
| B-10 | 2026-09-30 | Service Worker mit stale-while-revalidate; die Cache-Version in `sw.js` wird bei jedem Code-Release erhöht | Akzeptiert | `sw.js` |

---

> **Pflege:** Neue Entscheidung → Zeile im passenden Block ergänzen (nächste freie ID). Überholte Entscheidung → Status auf **Abgelöst** + Verweis auf die ablösende ID; Zeile nicht löschen.
