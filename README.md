# Piratenkompass

Web-App-Kompass im Vintage-Messing-Look für Schatzsuchen. Zeigt die Himmelsrichtungen und – wenn Stationen hinterlegt sind – mit einem Pfeil den Kurs, die Entfernung und die Ankunft an der nächsten Station.

- Läuft in Safari auf dem iPhone (Kompass über `webkitCompassHeading`, Standort über GPS). HTTPS ist Pflicht.
- Stationen, Titel und Einstellungen liegen nur lokal im Browser (`localStorage`); über „Als Link teilen“ lässt sich eine Jagd auf ein anderes Gerät übertragen.
- Logbuch (Einstellungen): Anker-Knopf oben rechts **lange drücken**.
- `?demo` simuliert Sensoren zum Ausprobieren am Rechner.

Tests der Rechen-/Parser-Logik: `npm test`
