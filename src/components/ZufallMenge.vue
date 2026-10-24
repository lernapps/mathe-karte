<script setup lang="ts">
// Die Ergebnismenge eines Laplace-Versuchs (Lage aus ZufallMenge.ts). modus hervor: günstige Ergebnisse orange umrandet,
// die übrigen blass (Kugeln und Glücksradfelder bleiben kräftig: ihre Farbe ist die Information); gegen: umgekehrt, für
// „nicht E“; neutral: nichts hervorgehoben; markierbar: jedes Ergebnis ist ein Knopf, markiert mit blauem Rahmen und
// Haken. Als Block zeigt es eine Urne (urne, ereignis), in einer Übung die Menge der Aufgabe (menge).
import { computed, reactive } from "vue";
import { MENGEN_TITEL, mengeBild, mengeFarben } from "./ZufallMenge.ts";

interface Element {
  id: string;
  label: string;
  name: string;
  farbe: string;
  guenstig: boolean;
}
interface Menge {
  art: "wuerfel" | "urne" | "gluecksrad" | "karten" | "lose" | "zweiwuerfel";
  kontext: string;
  ereignisName: string;
  gegenFrage: string;
  gegenKurz: string;
  elemente: Element[];
  farben: number;
}

const props = defineProps<{
  titel: string;
  menge?: Menge;
  urne?: string;
  ereignis?: string;
  modus?: "hervor" | "gegen" | "neutral" | "markierbar";
}>();

const m = computed(() => props.menge ?? mengeFarben("urne", props.urne ?? "3r2b1g", props.ereignis ?? "r"));
const bild = computed(() => mengeBild(m.value));
const markiert = reactive(new Set<string>());
const modus = computed(() => props.modus ?? "hervor");
const kraeftig = computed(() => m.value.art === "urne" || m.value.art === "gluecksrad");

function betont(guenstig: boolean): boolean {
  if (modus.value === "hervor") return guenstig;
  if (modus.value === "gegen") return !guenstig;
  return false;
}
const blass = (guenstig: boolean) =>
  !kraeftig.value && (modus.value === "hervor" || modus.value === "gegen") && !betont(guenstig);

function umschalten(id: string) {
  if (modus.value !== "markierbar") return;
  if (markiert.has(id)) markiert.delete(id);
  else markiert.add(id);
}
</script>

<template>
  <div class="zufall-bild">
    <svg
      :viewBox="`-4 -4 ${bild.breite + 8} ${bild.hoehe + 8}`"
      :width="bild.breite + 8"
      :height="bild.hoehe + 8"
      :role="modus === 'markierbar' ? 'group' : 'img'"
      :aria-label="`${MENGEN_TITEL[m.art]}: ${titel}`"
    >
      <title>{{ MENGEN_TITEL[m.art] }}: {{ titel }}</title>
      <g
        v-for="e in bild.elemente"
        :key="e.id"
        :opacity="blass(e.guenstig) ? 0.3 : undefined"
        :role="modus === 'markierbar' ? 'button' : undefined"
        :tabindex="modus === 'markierbar' ? 0 : undefined"
        :aria-pressed="modus === 'markierbar' ? markiert.has(e.id) : undefined"
        :aria-label="modus === 'markierbar' ? e.name : undefined"
        :class="modus === 'markierbar' ? 'zm-knopf' : ''"
        @click="umschalten(e.id)"
        @keydown.enter.prevent="umschalten(e.id)"
        @keydown.space.prevent="umschalten(e.id)"
      >
        <template v-if="e.form === 'sektor'">
          <path :d="e.d" :fill="e.farbe" stroke="#fff" stroke-width="2" />
          <path v-if="betont(e.guenstig)" :d="e.d" fill="none" class="zm-betont" />
          <path v-if="markiert.has(e.id)" :d="e.d" fill="none" class="zm-markiert" />
        </template>
        <template v-else-if="e.form === 'kugel'">
          <circle
            :cx="e.x + e.w / 2"
            :cy="e.y + e.h / 2"
            :r="e.w / 2"
            :fill="e.farbe"
            :class="betont(e.guenstig) ? 'zm-betont' : 'zm-rand'"
          />
        </template>
        <template v-else>
          <rect
            :x="e.x"
            :y="e.y"
            :width="e.w"
            :height="e.h"
            rx="5"
            fill="#fff"
            :class="betont(e.guenstig) ? 'zm-betont' : 'zm-rand'"
          />
          <circle v-for="(a, i) in e.augen" :key="i" :cx="a[0]" :cy="a[1]" :r="e.w / 11" fill="#1a1a1a" />
          <text
            v-if="e.form === 'feld'"
            :x="e.x + e.w / 2"
            :y="e.y + e.h / 2 + 4"
            text-anchor="middle"
            font-size="11"
            :fill="e.schrift"
          >
            {{ e.label }}
          </text>
        </template>
        <rect
          v-if="markiert.has(e.id) && e.form !== 'sektor'"
          :x="e.x - 3"
          :y="e.y - 3"
          :width="e.w + 6"
          :height="e.h + 6"
          rx="6"
          fill="none"
          class="zm-markiert"
        />
        <g v-if="markiert.has(e.id)" aria-hidden="true">
          <circle
            :cx="e.form === 'sektor' ? e.x : e.x + e.w - 2"
            :cy="e.form === 'sektor' ? e.y : e.y + 2"
            r="7"
            class="zm-haken"
          />
          <path
            :d="`M${(e.form === 'sektor' ? e.x : e.x + e.w - 2) - 4} ${e.form === 'sektor' ? e.y : e.y + 2} l3 3 l5 -6`"
            fill="none"
            stroke="#fff"
            stroke-width="2"
          />
        </g>
      </g>
      <polygon v-if="m.art === 'gluecksrad'" points="80,20 74,6 86,6" class="zm-zeiger" />
    </svg>
    <p v-if="modus === 'markierbar'" class="zm-stand" aria-live="polite">
      {{ markiert.size }} von {{ m.elemente.length }} markiert
    </p>
  </div>
</template>

<style scoped>
.zufall-bild svg {
  display: block;
  max-width: 100%;
  height: auto;
}
.zm-rand {
  stroke: #455a64;
  stroke-width: 1.5;
}
.zm-betont {
  stroke: #ff8f00;
  stroke-width: 4;
}
.zm-markiert {
  stroke: #1d4ed8;
  stroke-width: 3;
}
.zm-haken {
  fill: #1d4ed8;
  stroke: #fff;
  stroke-width: 1.5;
}
.zm-zeiger {
  fill: var(--page-text);
}
.zm-knopf {
  cursor: pointer;
}
.zm-knopf:focus-visible {
  outline: 3px solid var(--page-text);
}
.zm-stand {
  margin: 0.25rem 0 0;
  color: var(--page-muted);
}
</style>
