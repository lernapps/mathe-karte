<script setup lang="ts">
// Felder, „Prüfen“ und nach einem Versuch „Lösung zeigen“ mit dem Rechenweg; die Übung prüft (Ereignis pruefen).
import { reactive, ref, useId } from "vue";
import { type Feld, HINWEIS, leereWerte, vollstaendig } from "./ZufallAntwort.ts";

const props = defineProps<{
  felder: Feld[];
  weg: string[];
  geloest: boolean;
  /** Eine Übung ohne Felder (nur Auswahl) setzt bereit selbst. */
  bereit?: boolean;
}>();
const emit = defineEmits<{ pruefen: [werte: Record<string, string>] }>();

const id = useId();
const werte = reactive<Record<string, string>>(leereWerte(props.felder));
const versucht = ref(false);
const zeigeWeg = ref(false);

function pruefen() {
  if (props.felder.length > 0 && !vollstaendig(werte, props.felder)) return;
  if (props.felder.length === 0 && props.bereit === false) return;
  versucht.value = true;
  emit("pruefen", { ...werte });
}
</script>

<template>
  <div class="zufall-antwort">
    <p v-for="f in felder" :key="f.id" class="question-number">
      <label :for="`${id}-${f.id}`">{{ f.label }}</label>
      {{ " " }}
      <input
        :id="`${id}-${f.id}`"
        v-model="werte[f.id]"
        type="text"
        inputmode="text"
        autocomplete="off"
        spellcheck="false"
        @keydown.enter.prevent="pruefen"
      />
    </p>
    <p v-if="felder.length > 0" class="question-hint">{{ HINWEIS }}</p>
    <div class="question-actions">
      <button type="button" @click="pruefen">Prüfen</button>
      <button v-if="versucht && !geloest" type="button" class="question-solve" @click="zeigeWeg = !zeigeWeg">
        {{ zeigeWeg ? "Lösung verbergen" : "Lösung zeigen" }}
      </button>
    </div>
    <ol v-if="zeigeWeg || geloest" class="zufall-weg">
      <li v-for="(schritt, i) in weg" :key="i">{{ schritt }}</li>
    </ol>
  </div>
</template>

<style scoped>
.zufall-weg {
  margin: 0.75rem 0 0;
}
.zufall-antwort label {
  font-weight: 600;
}
</style>
