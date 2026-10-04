# Tasks — Piratenkompass

Granulare Aufgabenliste (niedrige Flughöhe), gegliedert nach den `ROADMAP.md`-Phasen. `[x]` erledigt · `[ ]` offen · `[~]` in Arbeit. Gepflegt im **Schmetterling**-Durchlauf.

---

## Einführung / Fundament

- [x] Projekt-Tracking eingeführt: sechs lebende Dokumente + „Schmetterling“-Routine (→ P-01)

## Phase 0 — Grundkompass & Veröffentlichung

- [x] Kompass mit Windrose, Zielpfeil, Entfernung und Ankunft (→ B-02)
- [x] Logbuch: Stationen anlegen, sortieren, löschen; Koordinaten-Parser für Zahlen, Maps-Links, Grad/Minuten  → verify: `npm test`
- [x] Teilen per Link-Hash (→ K-02)
- [x] Veröffentlichung auf GitHub Pages, Homescreen-Icon, Offline-Cache (→ B-01, B-10)

## Phase 1 — Erlebnis-Features

- [x] Startanimation mit Deckel und Nadelwirbel
- [x] Heiß-und-kalt-Modus (→ B-04)
- [x] Schatztruhen-Finale nur an der letzten Station (→ B-08)
- [x] Synthetische Klänge, Meeresrauschen, Möwen (→ B-05)
- [x] Geheime Notfall-Ankunft (→ B-03)
- [x] Sprachschnipsel statt Computerstimme, Sprecherskript `sounds/SPRECHERTEXT.md` (→ B-07)
- [x] Probelauf-Modus und Klangtests im Logbuch (→ B-09)
- [x] Allgemeine Sprachschnipsel (Begrüßung, nah 1–3, Ankunft 1–3, Finale) veröffentlicht
- [ ] Wirkung von Stimme, Sonar und Meeresrauschen im Probelauf auf dem iPhone prüfen; ggf. einzeln abschalten

## Phase 2 — Vorbereitung vor Ort

- [ ] Verstecke für die Kartenstücke in Kornburg scouten
- [ ] Stationen vor Ort per „Hier peilen (GPS)“ anlegen, Reihenfolge festlegen
- [ ] Stations-Schnipsel `station-1.mp3` … `station-N.mp3` aufnehmen, in `sounds/` legen, prüfen und veröffentlichen
- [ ] Probe-Runde draußen: GPS-Genauigkeit prüfen, Ankunftsradius und ggf. Kompass-Korrektur einstellen

## Phase 3 — Einsatz am Geburtstag

- [ ] Vor dem Start „Jagd neu starten“, Handy geladen, Auto-Sperre auf „Nie“

## Querschnitt (laufend)

- [ ] Bei jedem Code-Release die Cache-Version in `sw.js` erhöhen (→ B-10)
