# Roadmap — Piratenkompass

**Status:** Entwurf v1.0 · **Stand:** 2026-10-04
**Grundlage:** `README.md`, `DECISION_MAP.md`, `sounds/SPRECHERTEXT.md`
**Granulare Arbeitspakete:** `TASKS.md`

Leitprinzip: Die App dient genau einem Einsatz, der piratigen Schatzsuche zu Henrys Geburtstag quer durch Kornburg. Zuerst muss sie zuverlässig funktionieren (Kompass, Kurs zur Station), dann kommt die Atmosphäre, zuletzt die Vorbereitung vor Ort. Jede Phase endet mit einem einsetzbaren Stand.

---

## Phase 0 — Grundkompass & Veröffentlichung  ·  **erledigt**

**Ziel:** Ein zuverlässiger Kompass im Piraten-Look auf dem iPhone, der optional den Kurs zu vorher festgelegten Koordinaten zeigt.

- Messing-Kompass mit drehender Windrose (iPhone-Kompass-Sensor), Pfeil zur Station, Entfernung, Ankunft
- Logbuch: Stationen per Koordinaten, Maps-Link, Karte oder GPS-Peilung anlegen; Teilen per Link
- Veröffentlichung über HTTPS (GitHub Pages), Homescreen-fähig, offline-fähig

**Definition of Done:** Die App läuft unter https://spawnyzn.github.io/piratenkompass/ auf dem iPhone; der Nutzer hat bestätigt, dass es klappt.

---

## Phase 1 — Erlebnis-Features  ·  **funktional komplett**

**Ziel:** Die App fühlt sich wie ein echtes Piratenabenteuer an und ist robust gegen GPS-Probleme.

- Startanimation (Deckel klappt auf, Nadel wirbelt)
- Heiß-und-kalt-Modus auf den letzten Metern (Glühen, Sonar, zitternde Nadel)
- Finale mit Schatztruhe nur an der letzten Station; Zwischenstationen mit Schriftrolle
- Synthetische Klänge, Meeresrauschen; Piratenstimme als ElevenLabs-Schnipsel
- Geheime Notfall-Ankunft; Probelauf-Modus und Klangtests zum Testen zu Hause

**Definition of Done:** Alle Features sind im Probelauf auf dem iPhone erlebbar und einzeln abschaltbar. Offen ist nur noch die Wirkung vor Ort (→ Phase 2).

---

## Phase 2 — Vorbereitung vor Ort  ·  **in Arbeit**

**Ziel:** Die echte Route in Kornburg steht in der App, inklusive Hinweisen pro Station.

- Verstecke für die Kartenstücke scouten, Stationen per GPS-Peilung anlegen
- Stations-Schnipsel (`station-N.mp3`) aufnehmen und veröffentlichen
- Probe-Runde draußen: GPS-Genauigkeit, Ankunftsradius, Kompass-Korrektur, Lautstärke

**Definition of Done:** Die komplette Route ist einmal draußen erfolgreich abgelaufen worden, die Einstellungen sind justiert.

---

## Phase 3 — Einsatz am Geburtstag  ·  **geplant**

**Ziel:** Die Schatzsuche läuft am Tag der Feier ohne Technikpannen.

- Jagd neu starten (Station 1), Handy geladen, Auto-Sperre auf „Nie“
- Finale am Sandkasten des Spielplatzes

**Definition of Done:** Der Schatz ist ausgegraben.

---

## Nicht-Ziele (bewusst nicht in diesem Zyklus)

- Digitale Schatzkarte oder Fortschrittskarte (es gibt eine physische Karte, → K-04)
- Nachtmodus (gespielt wird bei Tag, → K-05)
- Code-Ziffern für ein Zahlenschloss (die Truhe hat ein Schlüssel-Schloss, → K-03)
- Computerstimme per Sprachausgabe des Geräts (→ B-06 abgelöst)
- Native App

---

## Sequenz auf einen Blick

```
Phase 0  Grundkompass .......... Kompass + Kurs zur Station online
Phase 1  Erlebnis-Features ..... Animationen, Klänge, Stimme, Probelauf
Phase 2  Vorbereitung vor Ort .. echte Route + Stations-Schnipsel + Probe-Runde
Phase 3  Geburtstag ............ Schatz ausgegraben
```
