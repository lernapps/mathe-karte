<script setup lang="ts">
// Das Bild zu einer Prozent-Aufgabe als SVG: Hunderterfeld, Prozentbalken oder Vergleichsbalken (diagramme.js der
// alten App). Die Prozent-Übungen zeichnen damit ihr „Bild zur Aufgabe“; es ist keine Übung und kein Block.
import { computed } from "vue";
import {
  type Bild,
  BREITE,
  SCHRIFT,
  balkenLage,
  bildText,
  prozentbalkenLage,
  rasterKaestchen,
} from "./ProzentAufgabe.ts";

// bild ist ein Bild aus ProzentAufgabe.ts; als unknown deklariert, weil der Build nur Prop-Typen liest, die ein Block
// aus YAML geben kann (Balken mit unbekanntem Wert sind null). Die Übungen geben immer ein Bild.
const props = defineProps<{ bild: unknown }>();
const bild = computed(() => props.bild as Bild);
const name = computed(() => bildText(bild.value));
const raster = computed(() => (bild.value.art === "raster" ? rasterKaestchen(bild.value.gefuellt) : []));
const prozentbalken = computed(() =>
  bild.value.art === "prozentbalken" ? prozentbalkenLage(bild.value.prozent, bild.value.mitte) : undefined,
);
const balken = computed(() => (bild.value.art === "balken" ? balkenLage(bild.value.balken) : { zeilen: [], hoehe: 0 }));
</script>

<template>
  <svg
    v-if="bild.art === 'raster'"
    class="prozent-svg"
    viewBox="0 0 260 300"
    role="img"
    :aria-label="name"
    xmlns="http://www.w3.org/2000/svg"
  >
    <template v-for="(k, i) in raster" :key="i">
      <rect :x="k.x" :y="k.y" width="22" height="22" rx="2" :class="k.voll ? 'an' : 'aus'" />
      <rect v-if="k.teil > 0" :x="k.x" :y="k.y" :width="22 * k.teil" height="22" rx="2" class="an" />
    </template>
    <text x="130" y="268" text-anchor="middle" font-size="14" class="schrift">{{ bild.titel }}</text>
    <text x="130" y="288" text-anchor="middle" font-size="12" class="schrift">{{ bild.untertitel }}</text>
  </svg>
  <svg
    v-else-if="bild.art === 'prozentbalken' && prozentbalken"
    class="prozent-svg"
    viewBox="0 0 340 92"
    role="img"
    :aria-label="name"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="10" y="28" width="320" height="30" rx="4" class="aus" />
    <rect x="10" y="28" :width="prozentbalken.breite" height="30" rx="4" class="an" />
    <line v-for="i in 9" :key="i" :x1="10 + 32 * i" y1="28" :x2="10 + 32 * i" y2="58" class="teiler" />
    <text :x="prozentbalken.mitteX" y="20" :font-size="SCHRIFT" text-anchor="middle" font-weight="600" class="akzent">
      {{ bild.mitte }}
    </text>
    <text x="10" y="80" :font-size="SCHRIFT" class="schrift">{{ bild.links }}</text>
    <text x="330" y="80" :font-size="SCHRIFT" text-anchor="end" class="schrift">{{ bild.rechts }}</text>
  </svg>
  <svg
    v-else-if="bild.art === 'balken'"
    class="prozent-svg"
    :viewBox="`0 0 ${BREITE + 16} ${balken.hoehe}`"
    role="img"
    :aria-label="name"
    xmlns="http://www.w3.org/2000/svg"
  >
    <text x="8" y="18" :font-size="SCHRIFT" font-weight="600" class="schrift">{{ bild.titel }}</text>
    <template v-for="(z, i) in balken.zeilen" :key="i">
      <rect x="8" :y="z.oben" :width="BREITE" height="30" rx="4" class="aus" />
      <rect x="8" :y="z.oben" :width="z.breite" height="30" rx="4" :class="z.grau ? 'grau' : 'an'" />
      <text v-for="t in z.texte" :key="t.y" x="8" :y="t.y" :font-size="SCHRIFT" class="schrift">{{ t.zeile }}</text>
    </template>
  </svg>
</template>

<style scoped>
.prozent-svg {
  display: block;
  width: 100%;
  max-width: 22rem;
  height: auto;
}
.an {
  fill: var(--page-accent, #1d4ed8);
}
.aus {
  fill: var(--page-surface, #f4f5f7);
  stroke: var(--page-border, #8a8f98);
  stroke-width: 0.5;
}
.grau {
  fill: var(--page-muted, #4a4a4a);
}
.teiler {
  stroke: var(--page-background, #ffffff);
  stroke-width: 1;
}
.schrift {
  fill: var(--page-text, #1a1a1a);
}
.akzent {
  fill: var(--page-accent, #1d4ed8);
}
</style>
