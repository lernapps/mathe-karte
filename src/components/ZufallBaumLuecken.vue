<script setup lang="ts">
// Übung zum Baumdiagramm: fehlende Zweige a, b, c, d eintragen; geprüft und richtig zeigt der Baum alle Werte und die
// Pfade. Die Übung ist die Eingabe der Aufgabe: Sie gibt die Werte mit answer weiter, sobald jedes Feld etwas hat;
// „Prüfen“ und die Rückmeldung kommen vom explainer (ZufallBaumLuecken.ts).
import { computed, ref } from "vue";
import ZufallAntwort from "./ZufallAntwort.vue";
import ZufallBaum from "./ZufallBaum.vue";
import { check, generate, weg } from "./ZufallBaumLuecken.ts";

const props = defineProps<{ seed: number; checked: boolean }>();
const emit = defineEmits<{ answer: [antwort: Record<string, string> | undefined] }>();
const aufgabe = computed(() => generate(props.seed));
const felder = computed(() =>
  aufgabe.value.luecken.map((l) => ({ id: l.buchstabe, label: `${l.buchstabe}) ${l.beschreibung} =` })),
);
const antwort = ref<Record<string, string> | undefined>(undefined);
const geloest = computed(() => props.checked && antwort.value !== undefined && check(aufgabe.value, antwort.value));

function eingabe(werte: Record<string, string> | undefined) {
  antwort.value = werte;
  emit("answer", werte);
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
    <ZufallAntwort :felder="felder" :weg="weg(aufgabe)" :geloest="geloest" :versucht="checked" @eingabe="eingabe" />
  </div>
</template>
