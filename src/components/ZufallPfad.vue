<script setup lang="ts">
// Übung zur 1. Pfadregel: der Baum der Aufgabe, der gefragte Pfad orange; geprüft und richtig mit
// Pfadwahrscheinlichkeiten. Die Übung ist die Eingabe der Aufgabe: Sie gibt P mit answer weiter; „Prüfen“ und die
// Rückmeldung kommen vom explainer (ZufallPfad.ts).
import { computed, ref } from "vue";
import ZufallAntwort from "./ZufallAntwort.vue";
import ZufallBaum from "./ZufallBaum.vue";
import { check, generate, weg } from "./ZufallPfad.ts";

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
    <ZufallBaum
      :titel="`Baumdiagramm, der Pfad ${aufgabe.namen.join('-')} ist orange`"
      :experiment="aufgabe.experiment"
      :urne="aufgabe.urne"
      :zuege="aufgabe.zuege"
      :modus="aufgabe.mit ? 'mit' : 'ohne'"
      :hervor="[aufgabe.pfad]"
      :zeige-pfad="geloest"
    />
    <ZufallAntwort
      :felder="[{ id: 'antwort', label: aufgabe.label }]"
      :weg="weg(aufgabe)"
      :geloest="geloest"
      :versucht="checked"
      @eingabe="eingabe"
    />
  </div>
</template>
