<script setup lang="ts">
// Übung mit Termeingabe für das Kapitel "Binomische Formeln": zeigt die Aufgabe der Aufgabennummer (seed) mit ihrem
// Flächenbild, liest den getippten Term mit Vorschau, prüft ihn (BinomTermAufgabe.ts) und meldet das Ergebnis mit
// dem Grund eines Fehlers (answered). Nach der richtigen Antwort oder auf Wunsch zeigt sie den Rechenweg.
import { computed, ref, useId } from "vue";
import BinomSvg from "./BinomSvg.vue";
import { termBild } from "./BinomBilder.ts";
import { check, eingabeHinweis, feldLabel, generate, grund, schrittText, vorschau } from "./BinomTermAufgabe.ts";

const props = defineProps<{
  seed: number;
  art: "klammern" | "erste" | "zweite" | "dritte" | "rueckwaerts";
  pruefen: string;
  loesungZeigen: string;
  tipp: string;
  rechenweg: string;
}>();
const emit = defineEmits<{ answered: [{ correct: boolean; reason: string }] }>();

const aufgabe = computed(() => generate(props.seed, { art: props.art }));
const antwort = ref("");
const richtig = ref(false);
const falsch = ref(false);
const loesungOffen = ref(false);
const geloest = computed(() => richtig.value || loesungOffen.value);
const bild = computed(() => termBild(aufgabe.value, geloest.value));
const id = useId();

function pruefe(): void {
  const korrekt = check(aufgabe.value, antwort.value);
  richtig.value = korrekt;
  falsch.value = !korrekt;
  emit("answered", { correct: korrekt, reason: grund(aufgabe.value, antwort.value) });
}
</script>

<template>
  <div class="binom-aufgabe">
    <p>
      {{ aufgabe.frage }} <strong class="binom-term">{{ aufgabe.term }}</strong>
    </p>
    <BinomSvg :zeichnung="bild" />
    <form class="binom-form" @submit.prevent="pruefe">
      <label :for="`${id}-antwort`">{{ feldLabel(aufgabe) }}</label>
      <input
        :id="`${id}-antwort`"
        v-model="antwort"
        type="text"
        :inputmode="aufgabe.zahl ? 'numeric' : 'text'"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        :aria-describedby="`${id}-hinweis`"
      />
      <span :id="`${id}-hinweis`" class="binom-hinweis">{{ eingabeHinweis(aufgabe) }}</span>
      <span class="binom-hinweis" aria-live="polite">{{ vorschau(aufgabe, antwort) }}</span>
      <span class="binom-knoepfe">
        <button type="submit">{{ pruefen }}</button>
        <button v-if="falsch && !geloest" type="button" class="binom-zweit" @click="loesungOffen = true">
          {{ loesungZeigen }}
        </button>
      </span>
    </form>
    <details v-if="!geloest" class="binom-tipp">
      <summary>{{ tipp }}</summary>
      <p>{{ aufgabe.tipp }}</p>
    </details>
    <div v-if="geloest" class="binom-weg">
      <p>
        <strong>{{ rechenweg }}</strong> {{ aufgabe.ergebnis }}
      </p>
      <ol>
        <li v-for="(schritt, i) in aufgabe.schritte" :key="i">{{ schrittText(schritt) }}</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.binom-term {
  white-space: nowrap;
}
.binom-form {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-width: 26rem;
}
.binom-form input {
  font: inherit;
  padding: 0.4rem 0.5rem;
  border: 2px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-text);
}
.binom-hinweis {
  color: var(--page-muted);
  font-size: 0.9375rem;
}
.binom-hinweis:empty {
  display: none;
}
.binom-knoepfe {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.binom-knoepfe button {
  font: inherit;
  padding: 0.5rem 1rem;
  border: 2px solid var(--page-accent);
  border-radius: 0.375rem;
  background: var(--page-accent);
  color: var(--page-on-accent);
  cursor: pointer;
}
.binom-knoepfe .binom-zweit {
  background: var(--page-background);
  color: var(--page-accent);
}
.binom-form input:focus-visible,
.binom-knoepfe button:focus-visible,
.binom-tipp summary:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: 2px;
}
.binom-tipp {
  margin: 0.75rem 0 0;
}
.binom-weg {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-left: 4px solid var(--page-accent);
  background: var(--page-surface);
}
</style>
