# Architecture — Piratenkompass

**Annotierte Karte des Repos:** wo liegt was und wofür. Gepflegt im **Schmetterling**-Durchlauf (nur bei Änderung der Grobstruktur).

> **Current-state, nicht append-only.** Das *warum* steht in `DECISION_MAP.md`.

**Stand:** 2026-10-15

---

## Grobstruktur

```
kompass/                     (GitHub: spawnYzn/piratenkompass, Pages von main → B-01)
├── index.html               Seitengerüst: Kompass-Ebenen (SVG), Overlays, Logbuch, Karte
├── style.css                Pergament-/Messing-Look, Animationen (Deckel, Glühen, Truhe)
├── app.js                   App-Logik: Sensoren, Render-Schleife, Stationen, Logbuch, Probelauf, Regiepult, Passwort
├── geo.js                   reine Logik ohne DOM: Peilung, Entfernung, Koordinaten-Parser, Teilen-Codec
├── audio.js                 WebAudio-Klänge, Meeresrauschen, Sprachschnipsel, Ansagen (`playStory`) → B-05, B-07, B-15
├── fernrohr.js              Fernrohr-Modus am Wasserturm: Kamera, Unschärfe, Treffer, Einmessen → B-11, B-12
├── assets/                  Platzhalter-Rätselbild (das echte liegt nur auf dem Gerät → B-13)
├── sw.js                    Service Worker (Offline-Cache) → B-10
├── manifest.webmanifest     Homescreen-App
├── icons/                   App-Icons (SVG + PNG)
├── sounds/                  ElevenLabs-Sprachschnipsel, 14 Regiepult-Ansagen (`NN_ort_ankunft/erfolg`) + SPRECHERTEXT.md
├── tests/                   node:test-Tests für geo.js
├── docs/FERNROHR.md         Testanleitung & offene Punkte zum Fernrohr-Modus
├── docs/produkt/            Projekt-Tracking (Roadmap, History, Decision Map, Architecture, Tasks, Mistakes)
├── CLAUDE.md                Leitdatei für Agenten
├── package.json             nur für `npm test`, keine Abhängigkeiten
└── .impeccable/             Cache/Konfiguration des Design-Hooks — für die App nicht relevant
```

## Schlüsseldateien

| Pfad | Zweck |
|---|---|
| `geo.js` | einzige Datei mit automatischen Tests (`npm test`), inkl. Kamera-Kurs und Fernrohr-Unschärfe |
| `sounds/SPRECHERTEXT.md` | Namensschema der Sprachschnipsel (`begruessung`, `nah-N`, `ankunft-N`, `finale`, `station-N`) und der Ansagen `01_start_ankunft` … `14_finale_erfolg` |
| `sw.js` | `CACHE`-Konstante bei jedem Release erhöhen |
