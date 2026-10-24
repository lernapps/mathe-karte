// Das Bild zum Beispiel (BinomBild.vue): die Aufgabe mit festen Werten statt Zufall, gelöst gezeichnet.
import { termBild } from "./BinomBilder.ts";
import { erzeugeTermAufgabe, type Art, type Vorgaben } from "./BinomFormeln.ts";
import { erzeugeKopfAufgabe, kopfBild } from "./BinomKopfrechnen.ts";
import type { Zeichnung } from "./BinomFlaeche.ts";
import { erzeugeZufall } from "./BinomTerm.ts";

export type BildArt = Art | "kopfrechnen";

export interface BildVorgaben extends Vorgaben {
  basis?: number;
  abstand?: number;
}

export function bildZumBeispiel(art: BildArt, vorgaben: BildVorgaben): Zeichnung {
  if (art === "kopfrechnen") return kopfBild(erzeugeKopfAufgabe(1, vorgaben), "geloest");
  return termBild(erzeugeTermAufgabe(art, erzeugeZufall(1), vorgaben), true);
}
