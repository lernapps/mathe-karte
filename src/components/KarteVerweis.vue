<script setup lang="ts">
// Ein Satz mit Link auf den Knoten der Seite in der Lehrplan-Karte. Ein Block kann diesen Link nicht setzen: Der
// explainer erlaubt in Texten nur eigene Seiten oder https-Adressen, die Karte liegt aber neben ihm (ADR-033).
import { computed } from "vue";
import { karteAdresse } from "./KarteVerweis.ts";

const props = defineProps<{ knoten: string; text: string; link: string }>();
const adresse = computed(() => karteAdresse(props.knoten));
</script>

<template>
  <p class="karte-verweis">
    {{ text }} <a :href="adresse">{{ link }}</a>
  </p>
</template>
