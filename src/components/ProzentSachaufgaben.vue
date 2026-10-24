<script setup lang="ts">
// Übung „Sachaufgaben übersetzen“ (Logik: ProzentSachaufgaben.ts), gezeigt von ProzentUebung.vue.
import { computed } from "vue";
import ProzentUebung from "./ProzentUebung.vue";
import { generate, grund } from "./ProzentSachaufgaben.ts";
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
