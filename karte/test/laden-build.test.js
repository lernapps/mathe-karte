// Use Case: Mathe-Karte – Eleventy-Daten der Karte aus karte/daten und den Kapiteln des explainers; data.json deterministisch.
import { test } from 'vite-plus/test';
import assert from 'node:assert/strict';
import { ladeKarte } from '../lib/laden.js';
import { ladeKapitel } from '../lib/kapitel.js';
import { leiteAdressenAb } from '../../lib/adressen.js';
import externe from '../daten/externe-eintraege.js';
import kapitel from '../daten/kapitel.js';

const apps = ladeKapitel({ kapitel, quelle: 'src', adressen: leiteAdressenAb('https://lernapps.github.io/mathe-karte/') });
const laden = (a = apps, e = externe) => ladeKarte({ ordner: 'karte/daten', apps: a, externe: e, version: '9.9.9' });
const karte = await laden();

test('ladeKarte: 5 Leitideen in Reihenfolge, 16 Lehrpläne, Hessen erfasst mit Stand 2021', () => {
  assert.deepEqual(karte.daten.leitideen.map((l) => l.reihenfolge), [1, 2, 3, 4, 5]);
  assert.equal(karte.daten.lehrplaene.length, 16);
  const he = karte.daten.lehrplaene.find((l) => l.land === 'HE');
  assert.equal(he.erfasst, 'vollstaendig');
  assert.equal(he.stand, 2021);
  assert.equal(karte.daten.version, '9.9.9');
});

test('ladeKarte: Binom kommt aus karte/daten/kapitel.js, zeigt auf das Kapitel und deckt klammern-binome ab', () => {
  const binom = karte.daten.eintraege.find((e) => e.id === 'binom-trainer');
  assert.equal(binom.url, 'https://lernapps.github.io/mathe-karte/binom/');
  assert.equal(binom.quellcode, 'https://github.com/lernapps/mathe-karte/tree/main/src/binom');
  assert.deepEqual(binom.kompetenzen, ['klammern-binome']);
  const knoten = karte.daten.kompetenzen.find((k) => k.id === 'klammern-binome');
  assert.deepEqual(knoten.abdeckung, ['binom-trainer']);
  assert.equal(knoten.status, 'ungeprueft');
});

test('ladeKarte: Prozent und Zufall stehen mit ihren Knoten auf der Karte', () => {
  const ids = karte.daten.eintraege.map((e) => e.id);
  assert.ok(ids.includes('prozent-trainer') && ids.includes('zufall-trainer'));
  assert.deepEqual(karte.daten.kompetenzen.find((k) => k.id === 'zufall-laplace').abdeckung, ['zufall-trainer']);
});

test('ladeKarte: data.json ohne Zeitstempel und deterministisch', async () => {
  const nochmal = await laden();
  assert.equal(karte.json, nochmal.json);
  assert.equal(karte.json, JSON.stringify(karte.daten, null, 2) + '\n');
  assert.equal('generiert' in karte.daten, false);
});

test('ladeKarte: Knoten, den es nicht gibt, bricht den Build ab', async () => {
  const kaputt = apps.map((a) => (a.pfad !== 'binom' ? a
    : { ...a, kompetenzen: a.kompetenzen.map((k, i) => (i ? k : { ...k, kartenKnoten: ['gibt-es-nicht'] })) }));
  await assert.rejects(laden(kaputt), /gibt-es-nicht/);
});

test('ladeKarte: Ansicht für die statischen Seiten (Baum mit Jahrgang Hessen, Status, Apps)', () => {
  const { ansicht } = karte;
  assert.equal(ansicht.baum.length, 5);
  const alle = ansicht.baum.flatMap((l) => l.knoten.flatMap((n) => [n, ...n.kinder]));
  assert.equal(alle.length, karte.daten.kompetenzen.length);
  const binome = alle.find((n) => n.kompetenz.id === 'klammern-binome');
  assert.deepEqual(binome.apps.map((e) => e.id), ['binom-trainer']);
  assert.match(binome.jahrgaenge, /8/);
  assert.equal(binome.status, '1 App · ungeprüft');
  assert.match(ansicht.zusammenfassung, /^Hessen · Gymnasium · alle Jahrgänge: \d+ Kompetenzen/);
  assert.equal(ansicht.lehrplaene[0].landname, 'Baden-Württemberg');
  assert.equal(ansicht.erfasst, 1);
});
