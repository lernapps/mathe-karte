<script setup lang="ts">
// Übung „Produkt, Summe, Potenz“: der Baum der Aufgabe und drei Terme zur Wahl; gelöst: die Pfade von E orange.
import { computed, ref, useId } from "vue";
import ZufallAntwort from "./ZufallAntwort.vue";
import ZufallBaum from "./ZufallBaum.vue";
import { BUCHSTABEN, check, generate, grund, weg } from "./ZufallTerm.ts";

const props = defineProps<{ seed: number }>();
const emit = defineEmits<{ answered: [ergebnis: { correct: boolean; reason: string }] }>();
const aufgabe = computed(() => generate(props.seed));
const id = useId();
const wahl = ref<number | undefined>(undefined);
const geloest = ref(false);

function pruefen() {
  if (wahl.value === undefined) return;
  geloest.value = check(aufgabe.value, wahl.value);
  emit("answered", { correct: geloest.value, reason: grund(aufgabe.value, wahl.value) });
}
</script>

<template>
  <div class="question">
    <p>{{ aufgabe.text }}</p>
    <ZufallBaum
      :titel="geloest ? `Baumdiagramm; orange: die Pfade von „${aufgabe.name}“` : 'Baumdiagramm zur Aufgabe'"
      :experiment="aufgabe.experiment"
      :urne="aufgabe.urne"
      :zuege="2"
      :modus="aufgabe.mit ? 'mit' : 'ohne'"
      :hervor="geloest ? aufgabe.pfade : []"
      :zeige-pfad="geloest"
    />
    <fieldset>
      <legend>Welcher Term berechnet P(E)?</legend>
      <label v-for="(o, i) in aufgabe.optionen" :key="i" class="question-option">
        <input v-model="wahl" type="radio" :name="id" :value="i" />
        <span>{{ BUCHSTABEN[i] }}) {{ o.text }}</span>
      </label>
    </fieldset>
    <ZufallAntwort
      :felder="[]"
      :weg="weg(aufgabe)"
      :geloest="geloest"
      :bereit="wahl !== undefined"
      @pruefen="pruefen"
    />
  </div>
</template>
