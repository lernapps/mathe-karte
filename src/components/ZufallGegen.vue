<script setup lang="ts">
// Übung zum Gegenereignis. Bild je nach Art: direkt ein Streifen aus P(E) und P(nicht E); einfach die Ergebnismenge zum
// Markieren von E (gelöst: „nicht E“ orange); mindestens der Baum mit dem einen Pfad des Gegenereignisses.
import { computed, ref } from "vue";
import ZufallAntwort from "./ZufallAntwort.vue";
import ZufallBaum from "./ZufallBaum.vue";
import ZufallMenge from "./ZufallMenge.vue";
import { text, zahl } from "./ZufallBruch.ts";
import { check, generate, grund, weg } from "./ZufallGegen.ts";

const props = defineProps<{ seed: number }>();
const emit = defineEmits<{ answered: [ergebnis: { correct: boolean; reason: string }] }>();
const aufgabe = computed(() => generate(props.seed));
const geloest = ref(false);
const BREITE = 300;
const teil = computed(() => Math.max(28, Math.min(BREITE - 28, BREITE * zahl(aufgabe.value.p))));

function pruefen(werte: Record<string, string>) {
  const antwort = werte["antwort"] ?? "";
  geloest.value = check(aufgabe.value, antwort);
  emit("answered", { correct: geloest.value, reason: grund(aufgabe.value, antwort) });
}
</script>

<template>
  <div class="question">
    <p>{{ aufgabe.text }}</p>
    <div v-if="aufgabe.art === 'direkt'" class="zufall-bild">
      <svg
        :viewBox="`0 0 ${BREITE + 20} 100`"
        :width="BREITE + 20"
        height="100"
        role="img"
        :aria-label="`Streifen: P(E) = ${text(aufgabe.p)}, der Rest ist P(nicht E)`"
      >
        <title>Streifen: P(E) = {{ text(aufgabe.p) }}, der Rest ist P(nicht E)</title>
        <g transform="translate(10 10)" font-size="13">
          <rect x="0" y="20" :width="teil" height="40" fill="#90caf9" stroke="#455a64" />
          <rect :x="teil" y="20" :width="BREITE - teil" height="40" fill="#ffe0b2" stroke="#ff8f00" stroke-width="2" />
          <text :x="teil / 2" y="45" text-anchor="middle" fill="#1a1a1a">{{ text(aufgabe.p) }}</text>
          <text :x="teil + (BREITE - teil) / 2" y="45" text-anchor="middle" font-weight="700" fill="#1a1a1a">
            {{ geloest ? text(aufgabe.loesung) : "?" }}
          </text>
          <text x="0" y="12" class="zg-text">E</text>
          <text :x="BREITE" y="12" text-anchor="end" class="zg-text">nicht E</text>
          <text :x="BREITE / 2" y="80" text-anchor="middle" class="zg-text">Zusammen: 1 (der ganze Streifen)</text>
        </g>
      </svg>
    </div>
    <ZufallMenge
      v-else-if="aufgabe.menge"
      :titel="
        geloest
          ? 'orange umrandet: die Ergebnisse von „nicht E“'
          : `klick die Ergebnisse von E an: ${aufgabe.menge.ereignisName}`
      "
      :menge="aufgabe.menge"
      :modus="geloest ? 'gegen' : 'markierbar'"
    />
    <ZufallBaum
      v-else-if="aufgabe.mind"
      :titel="`Baumdiagramm; orange: der einzige Pfad des Gegenereignisses „${aufgabe.mind.gegenName}“`"
      :experiment="aufgabe.mind.experiment === 'gluecksrad' ? 'urne' : aufgabe.mind.experiment"
      :urne="aufgabe.mind.urne"
      :zuege="aufgabe.mind.zuege"
      :modus="aufgabe.mind.mit ? 'mit' : 'ohne'"
      :ereignis="aufgabe.mind.gegenCode"
      :zeige-pfad="geloest"
      v-bind="aufgabe.mind.nurErgebnis ? { nurErgebnis: aufgabe.mind.nurErgebnis } : {}"
    />
    <ZufallAntwort
      :felder="[{ id: 'antwort', label: aufgabe.label }]"
      :weg="weg(aufgabe)"
      :geloest="geloest"
      @pruefen="pruefen"
    />
  </div>
</template>

<style scoped>
.zufall-bild svg {
  display: block;
  max-width: 100%;
  height: auto;
}
.zg-text {
  fill: var(--page-text);
}
</style>
