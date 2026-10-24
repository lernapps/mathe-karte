<script setup lang="ts">
// Übung zur 1. Pfadregel: der Baum der Aufgabe, der gefragte Pfad orange; gelöst mit Pfadwahrscheinlichkeiten.
import { computed, ref } from "vue";
import ZufallAntwort from "./ZufallAntwort.vue";
import ZufallBaum from "./ZufallBaum.vue";
import { check, generate, grund, weg } from "./ZufallPfad.ts";

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
      @pruefen="pruefen"
    />
  </div>
</template>
