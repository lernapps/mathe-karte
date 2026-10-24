<script setup lang="ts">
// Übung zum Baumdiagramm: fehlende Zweige a, b, c, d eintragen; gelöst zeigt der Baum alle Werte und die Pfade.
import { computed, ref } from "vue";
import ZufallAntwort from "./ZufallAntwort.vue";
import ZufallBaum from "./ZufallBaum.vue";
import { check, generate, grund, weg } from "./ZufallBaumLuecken.ts";

const props = defineProps<{ seed: number }>();
const emit = defineEmits<{ answered: [ergebnis: { correct: boolean; reason: string }] }>();
const aufgabe = computed(() => generate(props.seed));
const felder = computed(() =>
  aufgabe.value.luecken.map((l) => ({ id: l.buchstabe, label: `${l.buchstabe}) ${l.beschreibung} =` })),
);
const geloest = ref(false);

function pruefen(werte: Record<string, string>) {
  geloest.value = check(aufgabe.value, werte);
  emit("answered", { correct: geloest.value, reason: grund(aufgabe.value, werte) });
}
</script>

<template>
  <div class="question">
    <p>{{ aufgabe.text }}</p>
    <ZufallBaum
      :titel="`Baumdiagramm mit ${geloest ? 'allen' : 'fehlenden'} Zweigwahrscheinlichkeiten`"
      :experiment="aufgabe.experiment"
      :urne="aufgabe.urne"
      :zuege="aufgabe.zuege"
      :modus="aufgabe.mit ? 'mit' : 'ohne'"
      :versteckt="aufgabe.luecken.map((l) => l.id)"
      :geloest="geloest"
      :zeige-pfad="geloest"
    />
    <ZufallAntwort :felder="felder" :weg="weg(aufgabe)" :geloest="geloest" @pruefen="pruefen" />
  </div>
</template>
