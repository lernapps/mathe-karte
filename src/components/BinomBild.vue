<script setup lang="ts">
// Das Flächenbild zum Beispiel einer Seite: dieselbe Zeichnung wie in der Übung, mit festen Werten und gelöst. Ohne
// JavaScript steht an seiner Stelle der nojs-Text; mit JavaScript bleibt er als Bildbeschreibung zum Aufklappen.
import { computed } from "vue";
import BinomSvg from "./BinomSvg.vue";
import { bildZumBeispiel } from "./BinomBild.ts";

defineOptions({ nojs: "caption" });

const props = defineProps<{
  art: "klammern" | "erste" | "zweite" | "dritte" | "rueckwaerts" | "kopfrechnen";
  vorgaben: {
    m?: number;
    n?: number;
    m1?: number;
    n1?: number;
    m2?: number;
    n2?: number;
    formel?: number;
    basis?: number;
    abstand?: number;
  };
}>();

const zeichnung = computed(() => bildZumBeispiel(props.art, props.vorgaben));
</script>

<template>
  <BinomSvg :zeichnung="zeichnung" />
</template>
