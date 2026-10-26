<script setup lang="ts">
// Übung „mit und ohne Zurücklegen“: Urne vorher und nachher, die Bäume beider Arten; zwei Felder. Die Übung ist die
// Eingabe der Aufgabe: Sie gibt beide Werte mit answer weiter, sobald beide Felder etwas haben; „Prüfen“ und die
// Rückmeldung kommen vom explainer (ZufallOhne.ts).
import { computed, ref } from "vue";
import ZufallAntwort from "./ZufallAntwort.vue";
import ZufallUrnen from "./ZufallUrnen.vue";
import { check, generate, weg } from "./ZufallOhne.ts";

const props = defineProps<{ seed: number; checked: boolean }>();
const emit = defineEmits<{ answer: [antwort: Record<string, string> | undefined] }>();
const aufgabe = computed(() => generate(props.seed));
const felder = computed(() => [
  { id: "mit", label: `(1) ${aufgabe.value.beschriftung} mit Zurücklegen =` },
  { id: "ohne", label: `(2) ${aufgabe.value.beschriftung} ohne Zurücklegen =` },
]);
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
    <ZufallUrnen :urne="aufgabe.urne" :erster="aufgabe.erster" :zweiter="aufgabe.zweiter" :zeige-pfad="geloest" />
    <ZufallAntwort :felder="felder" :weg="weg(aufgabe)" :geloest="geloest" :versucht="checked" @eingabe="eingabe" />
  </div>
</template>
