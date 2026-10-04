# Architecture — Piratenkompass

**Annotierte Karte des Repos:** wo liegt was und wofür. Gepflegt im **Schmetterling**-Durchlauf (nur bei Änderung der Grobstruktur).

> **Current-state, nicht append-only.** Das *warum* steht in `DECISION_MAP.md`.

**Stand:** 2026-10-04

---

## Grobstruktur

```
kompass/                     (GitHub: spawnYzn/piratenkompass, Pages von main → B-01)
├── index.html               Seitengerüst: Kompass-Ebenen (SVG), Overlays, Logbuch, Karte
├── style.css                Pergament-/Messing-Look, Animationen (Deckel, Glühen, Truhe)
├── app.js                   App-Logik: Sensoren, Render-Schleife, Stationen, Logbuch, Probelauf
├── geo.js                   reine Logik ohne DOM: Peilung, Entfernung, Koordinaten-Parser, Teilen-Codec
├── audio.js                 WebAudio-Klänge, Meeresrauschen, Sprachschnipsel → B-05, B-07
├── sw.js                    Service Worker (Offline-Cache) → B-10
├── manifest.webmanifest     Homescreen-App
├── icons/                   App-Icons (SVG + PNG)
├── sounds/                  ElevenLabs-Sprachschnipsel + SPRECHERTEXT.md (Skript & Dateinamen)
├── tests/                   node:test-Tests für geo.js
├── docs/produkt/            Projekt-Tracking (Roadmap, History, Decision Map, Architecture, Tasks, Mistakes)
├── CLAUDE.md                Leitdatei für Agenten
├── package.json             nur für `npm test`, keine Abhängigkeiten
└── .impeccable/             Cache/Konfiguration des Design-Hooks — für die App nicht relevant
```

## Schlüsseldateien

| Pfad | Zweck |
|---|---|
| `geo.js` | einzige Datei mit automatischen Tests (`npm test`) |
| `sounds/SPRECHERTEXT.md` | Namensschema der Sprachschnipsel (`begruessung`, `nah-N`, `ankunft-N`, `finale`, `station-N`) |
| `sw.js` | `CACHE`-Konstante bei jedem Release erhöhen |
