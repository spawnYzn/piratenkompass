import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distance, bearing, angleDiff, dirName, parseCoords, encodeHunt, decodeHunt, formatDistance } from '../geo.js';

const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg ?? ''} ${a} ≉ ${b}`);

test('Peilung in die vier Himmelsrichtungen', () => {
  const o = { lat: 49.3839, lon: 11.1119 };
  near(bearing(o, { lat: 49.3939, lon: 11.1119 }), 0, 0.01, 'Nord');
  near(bearing(o, { lat: 49.3839, lon: 11.1219 }), 90, 0.1, 'Ost');
  near(bearing(o, { lat: 49.3739, lon: 11.1119 }), 180, 0.01, 'Süd');
  near(bearing(o, { lat: 49.3839, lon: 11.1019 }), 270, 0.1, 'West');
});

test('Entfernung: 0,01° Breite ≈ 1112 m', () => {
  near(distance({ lat: 49.38, lon: 11.11 }, { lat: 49.39, lon: 11.11 }), 1112, 2);
  assert.equal(distance({ lat: 49, lon: 11 }, { lat: 49, lon: 11 }), 0);
});

test('Winkeldifferenz über 0/360 hinweg', () => {
  assert.equal(angleDiff(350, 10), 20);
  assert.equal(angleDiff(10, 350), -20);
  assert.equal(angleDiff(720 + 5, 0), -5);
  assert.equal(angleDiff(-3605, 0), 5);
});

test('Richtungsnamen deutsch', () => {
  assert.equal(dirName(0), 'N');
  assert.equal(dirName(359), 'N');
  assert.equal(dirName(90), 'O');
  assert.equal(dirName(225), 'SW');
  assert.equal(dirName(67.5), 'ONO');
});

test('Koordinaten-Formate', () => {
  const exp = { lat: 49.3839, lon: 11.1119 };
  const same = (s) => {
    const p = parseCoords(s);
    assert.ok(p, `nicht erkannt: ${s}`);
    near(p.lat, exp.lat, 0.0001, s);
    near(p.lon, exp.lon, 0.0001, s);
  };
  same('49.3839, 11.1119');
  same('49.3839 11.1119');
  same('49,3839 11,1119');
  same('49,3839; 11,1119');
  same('https://www.google.com/maps/@49.3839,11.1119,17z');
  same('https://www.google.com/maps/place/X/@49.30,11.00,17z/data=!3m1!4b1!4m6!3m5!3d49.3839!4d11.1119');
  same('https://maps.apple.com/?ll=49.3839,11.1119&q=Schatz');
  same('https://maps.google.com/?q=49.3839,11.1119');
  same(`49°23'02.0"N 11°06'42.8"E`);
  same('N 49° 23.034 E 011° 06.714');
  same('N 49° 23.034 O 011° 06.714');
  assert.equal(parseCoords('hallo'), null);
  assert.equal(parseCoords('123.4, 11.1'), null);
  const sw = parseCoords(`33°51'35.9"S 151°12'40.0"W`);
  assert.ok(sw.lat < 0 && sw.lon < 0);
});

test('Schatzkarte teilen: Hin- und Rückweg mit Umlauten', () => {
  const h = {
    title: "Käpt'n Henrys Jagd",
    radius: 20,
    secret: true,
    stations: [
      { name: 'Alte Eiche', lat: 49.3839123, lon: 11.1119456, note: 'Unter der Bank schauen!' },
      { name: 'Brücke', lat: 49.385, lon: 11.113, note: '' },
    ],
  };
  const code = encodeHunt(h);
  assert.match(code, /^[A-Za-z0-9_-]+$/);
  const d = decodeHunt(code);
  assert.equal(d.title, h.title);
  assert.equal(d.radius, 20);
  assert.equal(d.secret, true);
  assert.equal(d.stations.length, 2);
  assert.equal(d.stations[0].note, 'Unter der Bank schauen!');
  near(d.stations[0].lat, 49.383912, 1e-6);
  assert.equal(decodeHunt('%%%kaputt'), null);
});

test('Entfernungsformat', () => {
  assert.equal(formatDistance(42.4), '42 m');
  assert.equal(formatDistance(1234), '1,23 km');
});
