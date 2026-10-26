<script setup lang="ts">
// Übung „Prozentsatz berechnen“ (Logik: ProzentProzentsatz.ts), gezeigt von ProzentUebung.vue. Sie ist die Eingabe ihrer Aufgabe: Sie gibt die
// Antworten der Felder mit answer weiter; „Prüfen“ und die Rückmeldung kommen vom explainer.
import { computed } from "vue";
import ProzentUebung from "./ProzentUebung.vue";
import { generate } from "./ProzentProzentsatz.ts";
import { type Antworten } from "./ProzentAufgabe.ts";

const props = defineProps<{ seed: number; checked: boolean }>();
const emit = defineEmits<{ answer: [antworten: Antworten | undefined] }>();
const aufgabe = computed(() => generate(props.seed));
</script>

<template>
  <ProzentUebung :aufgabe="aufgabe" :checked="checked" @eingabe="(antworten) => emit('answer', antworten)" />
</template>
