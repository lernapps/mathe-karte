<script setup lang="ts">
// Ziehen mit und ohne Zurücklegen nebeneinander: oben die Urne vor und nach dem ersten Zug mit der gezogenen Kugel,
// darunter die Bäume mit und ohne Zurücklegen untereinander, der Pfad erster-zweiter jeweils orange.
import { computed } from "vue";
import ZufallBaum from "./ZufallBaum.vue";
import { urnenBild } from "./ZufallUrnen.ts";
import { nameVon, urne as urneAus } from "./ZufallModell.ts";

const props = defineProps<{
  urne: string;
  erster: string;
  zweiter: string;
  zeigePfad?: boolean;
}>();

const bild = computed(() => urnenBild(props.urne, props.erster));
const pfad = computed(() => props.erster + props.zweiter);
const namen = computed(() => {
  const v = urneAus(props.urne);
  return `${nameVon(v, props.erster)}-${nameVon(v, props.zweiter)}`;
});
</script>

<template>
  <div class="zufall-bild">
    <svg
      :viewBox="`0 0 ${bild.breite} ${bild.hoehe}`"
      :width="bild.breite"
      :height="bild.hoehe"
      role="img"
      :aria-label="`Urne vorher mit ${bild.vorher.anzahl} Kugeln und nachher mit ${bild.nachher.anzahl} Kugeln; dazwischen die gezogene Kugel`"
    >
      <title>Urne vor und nach dem ersten Zug</title>
      <g v-for="(u, i) in [bild.vorher, bild.nachher]" :key="i">
        <text :x="u.x" y="13" font-size="12" font-weight="600" class="zu-text">
          {{ i === 0 ? "Vorher:" : "Nachher:" }}
        </text>
        <text :x="u.x" y="27" font-size="12" class="zu-text">{{ u.anzahl }} Kugeln</text>
        <path :d="u.d" class="zu-urne" stroke-width="2" />
        <circle v-for="(k, j) in u.kugeln" :key="j" :cx="k.x" :cy="k.y" r="12" :fill="k.farbe" class="zu-kugel" />
      </g>
      <path :d="bild.pfeil" class="zu-linie" stroke-width="2" />
      <circle
        :cx="bild.gezogen.x"
        :cy="bild.gezogen.y"
        r="12"
        :fill="bild.gezogen.farbe"
        stroke="#ff8f00"
        stroke-width="4"
      />
      <text :x="bild.gezogen.x" :y="bild.gezogen.y + 30" text-anchor="middle" font-size="12" class="zu-text">
        gezogen
      </text>
    </svg>
    <p class="zu-titel">Mit Zurücklegen</p>
    <ZufallBaum
      :titel="`Baum mit Zurücklegen, der Pfad ${namen} ist orange`"
      :urne="urne"
      :zuege="2"
      modus="mit"
      :hervor="[pfad]"
      :zeige-pfad="zeigePfad === true"
    />
    <p class="zu-titel">Ohne Zurücklegen</p>
    <ZufallBaum
      :titel="`Baum ohne Zurücklegen, der Pfad ${namen} ist orange`"
      :urne="urne"
      :zuege="2"
      modus="ohne"
      :hervor="[pfad]"
      :zeige-pfad="zeigePfad === true"
    />
  </div>
</template>

<style scoped>
.zufall-bild svg {
  display: block;
  max-width: 100%;
  height: auto;
}
.zu-text {
  fill: var(--page-text);
}
.zu-urne {
  fill: var(--page-surface);
  stroke: var(--page-border);
}
.zu-linie {
  stroke: var(--page-border);
}
.zu-kugel {
  stroke: rgba(0, 0, 0, 0.35);
  stroke-width: 1.5;
}
.zu-titel {
  margin: 1rem 0 0.25rem;
  font-weight: 700;
}
</style>
