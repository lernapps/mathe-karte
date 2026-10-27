<script setup lang="ts">
// Übung zur Laplace-Formel: die Ergebnismenge zum Markieren (die Markierung hilft beim Zählen und wird nicht geprüft);
// geprüft und richtig zeigt das Bild die günstigen Ergebnisse orange. Die Übung ist die Eingabe der Aufgabe: Sie gibt
// P(E) mit answer weiter; „Prüfen“ und die Rückmeldung kommen vom explainer (ZufallLaplace.ts).
import { computed, ref } from "vue";
import ZufallAntwort from "./ZufallAntwort.vue";
import ZufallMenge from "./ZufallMenge.vue";
import { check, generate, weg } from "./ZufallLaplace.ts";

const props = defineProps<{ seed: number; checked: boolean }>();
const emit = defineEmits<{ answer: [antwort: string | undefined] }>();
const aufgabe = computed(() => generate(props.seed));
const antwort = ref<string | undefined>(undefined);
const geloest = computed(() => props.checked && antwort.value !== undefined && check(aufgabe.value, antwort.value));

function eingabe(werte: Record<string, string> | undefined) {
  antwort.value = werte?.["antwort"];
  emit("answer", antwort.value);
}
</script>

<template>
  <div class="question">
    <p>{{ aufgabe.text }}</p>
    <p v-if="!geloest" class="question-hint">
      Klick die Ergebnisse an, die zum Ereignis passen – so zählst du leichter.
    </p>
    <ZufallMenge
      :titel="
        geloest
          ? `orange umrandet: ${aufgabe.menge.ereignisName}`
          : `klick die Ergebnisse an, die zu „${aufgabe.menge.ereignisName}“ passen`
      "
      :menge="aufgabe.menge"
      :modus="geloest ? 'hervor' : 'markierbar'"
    />
    <ZufallAntwort
      :felder="[{ id: 'antwort', label: 'P(E) =' }]"
      :weg="weg(aufgabe)"
      :geloest="geloest"
      :versucht="checked"
      @eingabe="eingabe"
    />
  </div>
</template>
