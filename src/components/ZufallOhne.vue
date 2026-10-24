<script setup lang="ts">
// Übung „mit und ohne Zurücklegen“: Urne vorher und nachher, die Bäume beider Arten; zwei Felder.
import { computed, ref } from "vue";
import ZufallAntwort from "./ZufallAntwort.vue";
import ZufallUrnen from "./ZufallUrnen.vue";
import { check, generate, grund, weg } from "./ZufallOhne.ts";

const props = defineProps<{ seed: number }>();
const emit = defineEmits<{ answered: [ergebnis: { correct: boolean; reason: string }] }>();
const aufgabe = computed(() => generate(props.seed));
const felder = computed(() => [
  { id: "mit", label: `(1) ${aufgabe.value.beschriftung} mit Zurücklegen =` },
  { id: "ohne", label: `(2) ${aufgabe.value.beschriftung} ohne Zurücklegen =` },
]);
const geloest = ref(false);

function pruefen(werte: Record<string, string>) {
  geloest.value = check(aufgabe.value, werte);
  emit("answered", { correct: geloest.value, reason: grund(aufgabe.value, werte) });
}
</script>

<template>
  <div class="question">
    <p>{{ aufgabe.text }}</p>
    <ZufallUrnen :urne="aufgabe.urne" :erster="aufgabe.erster" :zweiter="aufgabe.zweiter" :zeige-pfad="geloest" />
    <ZufallAntwort :felder="felder" :weg="weg(aufgabe)" :geloest="geloest" @pruefen="pruefen" />
  </div>
</template>
