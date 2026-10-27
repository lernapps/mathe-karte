<script setup lang="ts">
// Übung "Geschickt rechnen": zeigt eine Kopfrechenaufgabe der Aufgabennummer (seed) und fragt nach der Formel, die
// hilft, und nach dem Ergebnis. Sie ist die Eingabe der Aufgabe: Sie gibt beides mit answer weiter (undefined, solange
// nichts gewählt und getippt ist); „Prüfen“ und die Rückmeldung kommen vom explainer (BinomKopfrechnen.ts). Das
// Flächenbild zeigt erst nach dem ersten Prüfen (checked) die Zerlegung, nach der richtigen Antwort mit den Werten.
import { computed, ref, useId, watch } from "vue";
import BinomSvg from "./BinomSvg.vue";
import { FORMELN, antwortAus, check, generate, kopfBild, schrittText } from "./BinomKopfrechnen.ts";

const props = defineProps<{
  seed: number;
  frage: string;
  frageFormel: string;
  loesungZeigen: string;
  tipp: string;
  rechenweg: string;
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [{ formel: string; ergebnis: string } | undefined] }>();

const aufgabe = computed(() => generate(props.seed, {}));
const formel = ref("");
const ergebnis = ref("");
// einmal geprüft, bleibt die Zerlegung im Bild
const geprueft = ref(false);
watch(
  () => props.checked,
  (jetzt) => {
    if (jetzt) geprueft.value = true;
  },
);
const loesungOffen = ref(false);
const richtig = computed(
  () => props.checked && check(aufgabe.value, { formel: formel.value, ergebnis: ergebnis.value }),
);
const geloest = computed(() => richtig.value || loesungOffen.value);
const bild = computed(() => kopfBild(aufgabe.value, geloest.value ? "geloest" : geprueft.value ? "geprueft" : "neu"));
const id = useId();

watch([formel, ergebnis], () => emit("answer", antwortAus(formel.value, ergebnis.value)));
</script>

<template>
  <div class="binom-aufgabe">
    <p>
      {{ frage }} <strong class="binom-term">{{ aufgabe.rechnung }}</strong>
    </p>
    <BinomSvg :zeichnung="bild" />
    <div class="binom-form">
      <fieldset class="binom-wahl">
        <legend>{{ frageFormel }}</legend>
        <label v-for="f in FORMELN" :key="f.wert">
          <input v-model="formel" type="radio" :name="`${id}-formel`" :value="f.wert" />
          {{ f.text }}
        </label>
      </fieldset>
      <label :for="`${id}-ergebnis`">{{ aufgabe.rechnung }} =</label>
      <input
        :id="`${id}-ergebnis`"
        v-model="ergebnis"
        class="binom-zahl"
        type="text"
        inputmode="numeric"
        autocomplete="off"
      />
      <span v-if="geprueft && !geloest" class="binom-knoepfe">
        <button type="button" class="binom-zweit" @click="loesungOffen = true">
          {{ loesungZeigen }}
        </button>
      </span>
    </div>
    <details v-if="!geloest" class="binom-tipp">
      <summary>{{ tipp }}</summary>
      <p>{{ aufgabe.tipp }}</p>
    </details>
    <div v-if="geloest" class="binom-weg">
      <p>
        <strong>{{ rechenweg }}</strong> {{ aufgabe.rechnung }} = {{ aufgabe.formelText }} = {{ aufgabe.ergebnis }}
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
.binom-wahl {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0 0 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--page-border);
  border-radius: 0.375rem;
}
.binom-zahl {
  font: inherit;
  padding: 0.4rem 0.5rem;
  border: 2px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-text);
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
