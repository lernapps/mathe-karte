<script setup lang="ts">
// Übung „Produkt, Summe, Potenz“: der Baum der Aufgabe und drei Terme zur Wahl; geprüft und richtig: die Pfade von E
// orange. Die Übung ist die Eingabe der Aufgabe: Sie gibt die Nummer des gewählten Terms mit answer weiter; „Prüfen“
// und die Rückmeldung kommen vom explainer (ZufallTerm.ts).
import { computed, ref, useId, watch } from "vue";
import ZufallAntwort from "./ZufallAntwort.vue";
import ZufallBaum from "./ZufallBaum.vue";
import { BUCHSTABEN, check, generate, weg } from "./ZufallTerm.ts";

const props = defineProps<{ seed: number; checked: boolean }>();
const emit = defineEmits<{ answer: [wahl: number | undefined] }>();
const aufgabe = computed(() => generate(props.seed));
const id = useId();
const wahl = ref<number | undefined>(undefined);
const geloest = computed(() => props.checked && wahl.value !== undefined && check(aufgabe.value, wahl.value));

watch(wahl, (gewaehlt) => emit("answer", gewaehlt));
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
    <ZufallAntwort :felder="[]" :weg="weg(aufgabe)" :geloest="geloest" :versucht="checked" />
  </div>
</template>
