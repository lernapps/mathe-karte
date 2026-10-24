<script setup lang="ts">
// Übung „Zwei Werte vergleichen“ (Logik: ProzentVergleich.ts), gezeigt von ProzentUebung.vue.
import { computed } from "vue";
import ProzentUebung from "./ProzentUebung.vue";
import { generate, grund } from "./ProzentVergleich.ts";
import { type Antworten } from "./ProzentAufgabe.ts";

const props = defineProps<{ seed: number }>();
const emit = defineEmits<{ answered: [ergebnis: { correct: boolean; reason?: string }] }>();
const aufgabe = computed(() => generate(props.seed));

function geprueft(antworten: Antworten, richtig: boolean): void {
  emit("answered", richtig ? { correct: true } : { correct: false, reason: grund(aufgabe.value, antworten) });
}
</script>

<template>
  <ProzentUebung :aufgabe="aufgabe" @geprueft="geprueft" />
</template>
