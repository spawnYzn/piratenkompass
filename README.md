# Piratenkompass

Web-App-Kompass im Vintage-Messing-Look für Schatzsuchen. Zeigt die Himmelsrichtungen und, wenn Stationen hinterlegt sind, mit einem Pfeil den Kurs, die Entfernung und die Ankunft an der nächsten Station.

**Live:** https://spawnyzn.github.io/piratenkompass/

- Läuft in Safari auf dem iPhone (Kompass über `webkitCompassHeading`, Standort über GPS). HTTPS ist Pflicht.
- Stationen, Titel und Einstellungen liegen nur lokal im Browser (`localStorage`); über „Als Link teilen“ lässt sich eine Jagd auf ein anderes Gerät übertragen.
- Logbuch (Einstellungen): Anker-Knopf oben rechts **lange drücken**.
- Heiß-und-kalt-Modus auf den letzten Metern, Schatztruhen-Finale an der letzten Station, Meeresrauschen und synthetische Klänge.
- Piratenstimme: MP3-Schnipsel im Ordner `sounds/`, Skript und Dateinamen in `sounds/SPRECHERTEXT.md`.
- Testen zu Hause: Logbuch → „Probelauf zum aktuellen Ziel“ simuliert den Anlauf auf eine Station. Am Rechner simuliert `?demo` die Sensoren.

Tests der Rechen-/Parser-Logik: `npm test`

Projekt-Tracking (Roadmap, Entscheidungen, Aufgaben): `docs/produkt/`
