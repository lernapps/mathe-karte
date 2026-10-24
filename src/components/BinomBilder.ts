// Die Flächenbilder zu den Termaufgaben (BinomFormeln.ts): vor der richtigen Antwort mit den Rechnungen oder "?",
// danach mit den Werten. Reine Funktionen; aus js/vis/*.js der alten Lern-App übernommen.
import { produktBild, quadratMinus, raster, seiteVon, umlegen, type Zeichnung } from "./BinomFlaeche.ts";
import { klammer, type TermAufgabe } from "./BinomFormeln.ts";
import {
  alsAnzeige,
  betrag,
  glied,
  gliedAnzeige as g,
  mal,
  produkt,
  quadrat,
  quadratAnzeige,
  type Glied,
} from "./BinomTerm.ts";

/** Das Flächenbild zur Aufgabe: vor der richtigen Antwort mit den Rechnungen oder "?", danach mit den Werten. */
export function termBild(a: TermAufgabe, geloest: boolean): Zeichnung {
  const [u = glied(1, "x"), v = glied(1)] = a.p;
  const titel = `${a.term} = ${geloest ? (a.ergebnis.split(" = ").at(-1) ?? "") : "?"}`;
  if (a.art === "klammern") {
    const minus = a.p.some((t) => t.k < 0) || a.q.some((t) => t.k < 0);
    return produktBild(
      a.p,
      a.q,
      geloest,
      titel,
      minus ? "Feld = Zeile mal Spalte, rot = abziehen" : "Feld = Zeile mal Spalte",
    );
  }
  if (a.art === "erste") {
    const ab = produkt(u, v);
    const unter = geloest
      ? `Zwei gleiche Streifen: 2 · ${g(ab)} = ${g(mal(ab, 2))}`
      : "Zwei gleiche Streifen a · b → 2ab";
    return produktBild(a.p, a.q, geloest, titel, unter);
  }
  const vb = betrag(v);
  if (a.art === "zweite") {
    return quadratMinus(
      seiteVon(u),
      seiteVon(vb),
      {
        rest: `${klammer([u, mal(vb, -1)])}²`,
        restSeite: alsAnzeige([u, mal(vb, -1)]),
        streifen: geloest ? g(produkt(u, vb)) : `${g(u)} · ${g(vb)}`,
        ecke: geloest ? g(quadrat(vb)) : quadratAnzeige(vb),
      },
      titel,
      `${quadratAnzeige(u)} − zwei Streifen + Ecke zurück`,
    );
  }
  if (a.art === "dritte") {
    return umlegen(
      seiteVon(u),
      seiteVon(vb),
      {
        ecke: `− ${geloest ? g(quadrat(vb)) : quadratAnzeige(vb)}`,
        oben: `${quadratAnzeige(u)} ohne die Ecke ${quadratAnzeige(vb)}`,
        unten: `umgelegt: ${klammer([u, vb])}${klammer([u, mal(vb, -1)])}`,
        rest: alsAnzeige([u, mal(vb, -1)]),
      },
      titel,
      "Gleiche Teile, gleiche Fläche",
    );
  }
  return rueckwaertsBild(a, u, v, geloest);
}

function rueckwaertsBild(a: TermAufgabe, u: Glied, v: Glied, geloest: boolean): Zeichnung {
  const istLuecke = a.luecke !== "";
  const ab = produkt(u, v);
  const seite = (t: Glied): string => (geloest || istLuecke ? g(t) : "?");
  const zeige = (t: Glied, gefragt: boolean): string => (gefragt && !geloest ? "?" : g(t));
  const mitteGefragt = a.luecke === "mitte";
  const endeGefragt = a.luecke === "ende";
  const loesungsterm = a.ergebnis.split(" = ").at(-1) ?? "";
  const titel = istLuecke ? (geloest ? a.ergebnis : a.term) : `${a.term} = ${geloest ? loesungsterm : "?"}`;
  const frage = istLuecke ? "Welche Teilfläche fehlt?" : "";
  if (a.formel === 1) {
    return raster(
      [u, v].map((t) => seiteVon(t, seite(t))),
      [u, v].map((t) => seiteVon(t, seite(t))),
      [
        [
          { flaeche: "a", text: g(quadrat(u)) },
          { flaeche: "ab", text: zeige(ab, mitteGefragt) },
        ],
        [
          { flaeche: "ab", text: zeige(ab, mitteGefragt) },
          { flaeche: "b", text: zeige(quadrat(v), endeGefragt) },
        ],
      ],
      titel,
      frage || "Teilflächen gegeben – welche Seite hat das Quadrat?",
    );
  }
  if (a.formel === 2) {
    return quadratMinus(
      seiteVon(u, seite(u)),
      seiteVon(v, seite(v)),
      {
        rest: geloest ? `${klammer([u, mal(v, -1)])}²` : "?",
        restSeite: geloest ? alsAnzeige([u, mal(v, -1)]) : "?",
        streifen: zeige(ab, mitteGefragt),
        ecke: zeige(quadrat(v), endeGefragt),
      },
      titel,
      frage || "Welches Quadrat bleibt übrig?",
    );
  }
  return umlegen(
    seiteVon(u, seite(u)),
    seiteVon(v, seite(v)),
    {
      ecke: `− ${g(quadrat(v))}`,
      oben: `${g(quadrat(u))} ohne die Ecke ${g(quadrat(v))}`,
      unten: geloest ? `umgelegt: ${loesungsterm}` : "umgelegt: ein Rechteck – welche Seiten?",
      rest: geloest ? alsAnzeige([u, mal(v, -1)]) : "?",
    },
    titel,
    "Gleiche Teile, gleiche Fläche",
  );
}
