// Die Lage des Bildes „Urne vor und nach dem ersten Zug“ (ZufallUrnen.vue), rein: zwei Urnen mit ihren Kugeln, dazwischen
// die gezogene Kugel.
import { type Ergebnis, entferne, ergebnis, urne } from "./ZufallModell.ts";

export interface KugelBild {
  x: number;
  y: number;
  farbe: string;
}

export interface UrneBild {
  x: number;
  breite: number;
  hoehe: number;
  d: string;
  kugeln: KugelBild[];
  anzahl: number;
}

export interface UrnenBild {
  breite: number;
  hoehe: number;
  vorher: UrneBild;
  nachher: UrneBild;
  gezogen: KugelBild;
  pfeil: string;
}

const R = 12;
const ABSTAND = 28;
const KOPF = 34;
const LUECKE = 66;

function urneBei(x: number, ergebnisse: readonly Ergebnis[]): UrneBild {
  const farben = ergebnisse.flatMap((e) => Array.from({ length: e.anzahl }, () => e.farbe));
  const proZeile = Math.max(3, Math.ceil(Math.sqrt(farben.length)));
  const zeilen = Math.ceil(farben.length / proZeile);
  const innen = proZeile * ABSTAND + 8;
  const hoehe = zeilen * ABSTAND + 14;
  const unten = KOPF + hoehe;
  const kugeln = farben.map((farbe, i) => ({
    x: x + 6 + R + 2 + (i % proZeile) * ABSTAND,
    y: unten - 6 - R - 1 - Math.floor(i / proZeile) * ABSTAND,
    farbe,
  }));
  const d = `M${x} ${KOPF} L${x} ${unten - 6} Q${x} ${unten} ${x + 6} ${unten} L${x + innen - 6} ${unten} Q${x + innen} ${unten} ${x + innen} ${unten - 6} L${x + innen} ${KOPF}`;
  return { x, breite: innen, hoehe, d, kugeln, anzahl: farben.length };
}

/** Das Bild zur Urne `spec`, aus der zuerst eine Kugel `erster` gezogen wird. */
export function urnenBild(spec: string, erster: string): UrnenBild {
  const v = urne(spec);
  const vorher = urneBei(2, v.ergebnisse);
  const nachher = urneBei(vorher.x + vorher.breite + LUECKE, entferne(v, erster).ergebnisse);
  const gx = vorher.x + vorher.breite + LUECKE / 2;
  const gy = KOPF + 24;
  return {
    breite: nachher.x + nachher.breite + 2,
    hoehe: KOPF + Math.max(vorher.hoehe, nachher.hoehe) + 4,
    vorher,
    nachher,
    gezogen: { x: gx, y: gy, farbe: ergebnis(v, erster)?.farbe ?? "#999999" },
    pfeil: `M${vorher.x + vorher.breite + 4} ${gy} L${nachher.x - 4} ${gy}`,
  };
}
