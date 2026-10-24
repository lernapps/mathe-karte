<script setup lang="ts">
// Zeichnet ein Flächenbild (BinomFlaeche.ts) als SVG: Teilflächen in ihren Farben, Texte, Linien. Die Übungen und
// BinomBild.vue zeigen ihre Bilder damit; Farben der Flächen fest und hell, Texte außen in den Farben der Seite.
// Die Typen stehen hier noch einmal ausgeschrieben, weil die Prüfung der Props nur Typen dieser Datei liest; sie
// gleichen Form und Zeichnung aus BinomFlaeche.ts (vue-tsc prüft das bei jeder Verwendung).
interface Form {
  art: "rect" | "text" | "line";
  x: number;
  y: number;
  w: number;
  h: number;
  flaeche: "a" | "ab" | "b" | "minus" | "leer" | "luecke";
  gestrichelt: boolean;
  text: string;
  groesse: number;
  anker: "start" | "middle" | "end";
  ton: "normal" | "leise" | "innen" | "minus" | "plus";
  fett: boolean;
}
interface Zeichnung {
  breite: number;
  hoehe: number;
  label: string;
  formen: Form[];
}

defineProps<{ zeichnung: Zeichnung }>();
</script>

<template>
  <svg
    class="binom-svg"
    :viewBox="`0 0 ${zeichnung.breite} ${zeichnung.hoehe}`"
    role="img"
    :aria-label="zeichnung.label"
  >
    <template v-for="(form, i) in zeichnung.formen" :key="i">
      <rect
        v-if="form.art === 'rect'"
        :x="form.x"
        :y="form.y"
        :width="form.w"
        :height="form.h"
        :class="`binom-${form.flaeche}`"
        :stroke-dasharray="form.gestrichelt ? '4 3' : undefined"
        stroke-width="1.5"
      />
      <text
        v-else-if="form.art === 'text'"
        :x="form.x"
        :y="form.y"
        :font-size="form.groesse"
        :text-anchor="form.anker"
        :font-weight="form.fett ? 700 : undefined"
        :class="`binom-ton-${form.ton}`"
      >
        {{ form.text }}
      </text>
      <line v-else :x1="form.x" :y1="form.y" :x2="form.x + form.w" :y2="form.y + form.h" class="binom-linie" />
    </template>
  </svg>
</template>

<style scoped>
.binom-svg {
  display: block;
  width: 100%;
  max-width: 26rem;
  height: auto;
  margin: 0.5rem 0;
  font-family: inherit;
}
.binom-a {
  fill: #dbeafe;
  stroke: #1d4ed8;
}
.binom-ab {
  fill: #fef3c7;
  stroke: #b45309;
}
.binom-b {
  fill: #dcfce7;
  stroke: #166534;
}
.binom-minus {
  fill: #fee2e2;
  stroke: #b91c1c;
}
.binom-leer {
  fill: #ffffff;
  stroke: #6b7280;
}
.binom-luecke {
  fill: none;
  stroke: var(--page-muted);
}
.binom-linie {
  stroke: var(--page-muted);
}
.binom-ton-normal {
  fill: var(--page-text);
}
.binom-ton-leise {
  fill: var(--page-muted);
}
.binom-ton-innen {
  fill: #1a1a1a;
}
.binom-ton-minus {
  fill: var(--page-wrong);
}
.binom-ton-plus {
  fill: var(--page-right);
}
</style>
