<script setup lang="ts">
// Übung zur Laplace-Formel: die Ergebnismenge zum Markieren (die Markierung hilft beim Zählen und wird nicht geprüft);
// gelöst zeigt das Bild die günstigen Ergebnisse orange.
import { computed, ref } from "vue";
import ZufallAntwort from "./ZufallAntwort.vue";
import ZufallMenge from "./ZufallMenge.vue";
import { check, generate, grund, weg } from "./ZufallLaplace.ts";

const props = defineProps<{ seed: number }>();
const emit = defineEmits<{ answered: [ergebnis: { correct: boolean; reason: string }] }>();
const aufgabe = computed(() => generate(props.seed));
const geloest = ref(false);

function pruefen(werte: Record<string, string>) {
  const antwort = werte["antwort"] ?? "";
  geloest.value = check(aufgabe.value, antwort);
  emit("answered", { correct: geloest.value, reason: grund(aufgabe.value, antwort) });
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
      @pruefen="pruefen"
    />
  </div>
</template>
