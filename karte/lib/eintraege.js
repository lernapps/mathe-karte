/*
 * App-Einträge der Mathe-Karte. Ein Kapitel des explainers erscheint auf der Karte über karte/daten/kapitel.js
 * (kartenEintrag mit den Eintrags-Feldern, je Seite kartenKnoten), geladen von karte/lib/kapitel.js. Apps, die nicht
 * in diesem Repository liegen, stehen in karte/daten/externe-eintraege.js.
 */
const UEBERGANG = 'karte/daten/externe-eintraege.js';

const konfig = () => 'karte/daten/kapitel.js';

function knotenDer(app) {
  return [...new Set((app.kompetenzen ?? []).flatMap((k) => k.kartenKnoten ?? []))];
}

/** Eintrag im Format von data.json (eintraege[]) oder null, wenn die App nicht auf die Karte gehört. */
export function eintragAusApp(app) {
  const f = app.kartenEintrag;
  if (!f) return null;
  return {
    id: app.id,
    titel: app.titel,
    url: app.basisUrl,
    quellcode: app.quellcode,
    kompetenzen: knotenDer(app),
    'aktiv-level': f['aktiv-level'],
    backend: f.backend,
    'external-requests': f['external-requests'],
    dsgvo: f.dsgvo,
    evidence: f.evidence,
    jahrgaenge: f.jahrgaenge ?? (app.klasse ? [app.klasse] : []),
    lizenz: f.lizenz,
    stand: f.stand,
    beschreibung: app.beschreibung,
  };
}

/** Fehler der Karten-Konfiguration einer App; knotenIds: Set aller Knoten der Karte. */
export function pruefeAppEintrag(app, knotenIds) {
  const fehler = [];
  const mitKnoten = (app.kompetenzen ?? []).filter((k) => k.kartenKnoten);
  if (!app.kartenEintrag && !mitKnoten.length) return fehler;
  if (!app.kartenEintrag) fehler.push(`${konfig(app)}: Seiten mit Knoten, aber kartenEintrag fehlt`);
  if (!mitKnoten.length) fehler.push(`${konfig(app)}: kartenEintrag gesetzt, aber keine Seite hat Knoten`);
  for (const k of mitKnoten) {
    if (!Array.isArray(k.kartenKnoten)) { fehler.push(`${konfig(app)}: kartenKnoten der Seite "${k.id}" muss eine Liste sein`); continue; }
    for (const id of k.kartenKnoten) {
      if (!knotenIds.has(id)) fehler.push(`${konfig(app)}: kartenKnoten "${id}" der Seite "${k.id}" ist kein Knoten der Karte (karte/daten/kompetenzen/)`);
    }
  }
  return fehler;
}

/** Alle Einträge der Karte, sortiert nach id: Apps mit kartenEintrag plus Übergangseinträge (externe). */
export function eintraegeFuerKarte(apps, externe = []) {
  const eintraege = apps.map(eintragAusApp).filter(Boolean);
  for (const { pfad, ...e } of externe) {
    const app = apps.find((a) => a.pfad === pfad);
    if (app?.kartenEintrag) {
      throw new Error(`${UEBERGANG}: Übergangseintrag "${e.id}" löschen – ${konfig(app)} trägt das Kapitel jetzt`);
    }
    eintraege.push(app ? { ...e, url: app.basisUrl, quellcode: app.quellcode } : e);
  }
  return eintraege.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
