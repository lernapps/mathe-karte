<script setup lang="ts">
// Ein Baumdiagramm (Lage aus ZufallBaum.ts). Als Block zeigt es das Bild eines Beispiels; in einer Übung zeichnet es den
// Baum der Aufgabe, mit fehlenden Zweigen (versteckt), orangen Pfaden (hervor, ereignis) oder anklickbaren Blättern
// (waehlbar: meldet umschalten mit dem Pfad).
import { computed } from "vue";
import { baumBild } from "./ZufallBaum.ts";
import { baueBaum, ereignisPfade, nurErgebnisUndRest, versuchAus } from "./ZufallModell.ts";

const props = defineProps<{
  titel: string;
  experiment?: "urne" | "muenze" | "wuerfel" | "gluecksrad";
  urne?: string;
  zuege?: number;
  modus?: "mit" | "ohne";
  nurErgebnis?: string;
  ereignis?: string;
  hervor?: string[];
  zeigePfad?: boolean;
  versteckt?: string[];
  geloest?: boolean;
  waehlbar?: boolean;
  auswahl?: string[];
}>();
const emit = defineEmits<{ umschalten: [pfad: string] }>();

const baum = computed(() => {
  const versuch = versuchAus(props.experiment, props.urne);
  const v = props.nurErgebnis === undefined ? versuch : nurErgebnisUndRest(versuch, props.nurErgebnis);
  return baueBaum(v, props.zuege ?? 2, props.modus !== "ohne");
});
const gewaehlt = computed(() => new Set(props.auswahl ?? []));
const bild = computed(() =>
  baumBild(baum.value, {
    versteckt: props.versteckt ?? [],
    geloest: props.geloest === true,
    zeigePfad: props.zeigePfad === true,
    hervor: [
      ...(props.hervor ?? []),
      ...(props.ereignis === undefined ? [] : ereignisPfade(baum.value, props.ereignis).map((k) => k.id)),
      ...gewaehlt.value,
    ],
  }),
);
</script>

<template>
  <div class="zufall-bild">
    <svg
      :viewBox="`0 0 ${bild.breite} ${bild.hoehe}`"
      :width="bild.breite"
      :height="bild.hoehe"
      :role="waehlbar ? 'group' : 'img'"
      :aria-label="titel"
    >
      <title>{{ titel }}</title>
      <circle :cx="bild.wx" :cy="bild.wy" r="6" class="zb-wurzel" />
      <g fill="none">
        <path
          v-for="z in bild.zweige"
          :key="`l${z.id}`"
          :d="z.d"
          :class="z.betont ? 'zb-zweig zb-betont' : 'zb-zweig'"
        />
      </g>
      <g v-for="k in bild.knoten" :key="`k${k.id}`" :transform="`translate(${k.x} ${k.y})`">
        <circle r="12" :fill="k.farbe" class="zb-knoten" />
        <text y="4" text-anchor="middle" font-weight="700" font-size="13" :fill="k.schrift">{{ k.kuerzel }}</text>
        <title>{{ k.name }}</title>
      </g>
      <g class="zb-labels" font-size="13" text-anchor="middle">
        <template v-for="z in bild.zweige" :key="`t${z.id}`">
          <text :x="z.lx" :y="z.ly" :class="z.buchstabe ? 'zb-fehlt' : ''">
            {{ z.text }}
            <title>{{ z.titel }}</title>
          </text>
          <text v-if="z.buchstabe" :x="z.bx" :y="z.by" class="zb-fehlt" font-weight="700">{{ z.buchstabe }}</text>
        </template>
      </g>
      <g
        v-for="b in bild.blaetter"
        :key="`b${b.id}`"
        :role="waehlbar ? 'button' : undefined"
        :tabindex="waehlbar ? 0 : undefined"
        :aria-pressed="waehlbar ? gewaehlt.has(b.id) : undefined"
        :aria-label="waehlbar ? `Pfad ${b.name}` : undefined"
        :class="waehlbar ? 'zb-waehlbar' : ''"
        @click="waehlbar && emit('umschalten', b.id)"
        @keydown.enter.prevent="waehlbar && emit('umschalten', b.id)"
        @keydown.space.prevent="waehlbar && emit('umschalten', b.id)"
      >
        <rect :x="b.rx" :y="b.ry" :width="b.rw" :height="b.rh" rx="6" class="zb-treffer" />
        <text v-if="b.pfadText" :x="b.x" :y="b.py" text-anchor="middle" font-size="13" class="zb-text">
          {{ b.pfadText }}
        </text>
      </g>
      <text v-if="bild.legende" x="4" :y="bild.legendeY" font-size="13" class="zb-text">{{ bild.legende }}</text>
    </svg>
  </div>
</template>

<style scoped>
.zufall-bild svg {
  display: block;
  max-width: 100%;
  height: auto;
}
.zb-wurzel {
  fill: var(--page-muted);
}
.zb-zweig {
  stroke: var(--page-border);
  stroke-width: 2;
}
.zb-betont {
  stroke: #ff8f00;
  stroke-width: 4;
}
.zb-knoten {
  stroke: #455a64;
}
.zb-labels text,
.zb-text {
  fill: var(--page-text);
}
.zb-labels text {
  stroke: var(--page-background);
  stroke-width: 4;
  stroke-linejoin: round;
  paint-order: stroke;
}
.zb-labels .zb-fehlt {
  fill: #b45309;
  font-weight: 700;
}
@media (prefers-color-scheme: dark) {
  .zb-labels .zb-fehlt {
    fill: #fbbf24;
  }
}
.zb-treffer {
  fill: transparent;
}
.zb-waehlbar {
  cursor: pointer;
}
.zb-waehlbar[aria-pressed="true"] .zb-treffer {
  stroke: var(--page-accent);
  stroke-width: 2;
}
.zb-waehlbar:focus-visible {
  outline: 3px solid var(--page-text);
}
</style>
