<script setup lang="ts">
// Die Felder einer Zufall-Übung und nach einer geprüften falschen Antwort „Lösung zeigen“ mit dem Rechenweg. Sie
// meldet jede Änderung mit eingabe: die Werte, sobald jedes Feld etwas hat, sonst undefined. „Prüfen“ kommt vom
// explainer; Enter in einem Feld prüft auch. Kein Block.
import { reactive, ref, useId, watch } from "vue";
import { type Feld, HINWEIS, leereWerte, vollstaendig } from "./ZufallAntwort.ts";

const props = defineProps<{
  felder: Feld[];
  weg: string[];
  geloest: boolean;
  /** Ob der explainer die Antwort geprüft hat (checked der Übung). */
  versucht: boolean;
}>();
const emit = defineEmits<{ eingabe: [werte: Record<string, string> | undefined] }>();

const id = useId();
const werte = reactive<Record<string, string>>(leereWerte(props.felder));
const zeigeWeg = ref(false);
// einmal geprüft, bleibt „Lösung zeigen“, auch wenn das Kind die Antwort danach ändert
const geprueft = ref(false);
watch(
  () => props.versucht,
  (jetzt) => {
    if (jetzt) geprueft.value = true;
  },
);

watch(werte, () => emit("eingabe", vollstaendig(werte, props.felder) ? { ...werte } : undefined));
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
      />
    </p>
    <p v-if="felder.length > 0" class="question-hint">{{ HINWEIS }}</p>
    <div v-if="geprueft && !geloest" class="question-actions">
      <button type="button" class="question-solve" @click="zeigeWeg = !zeigeWeg">
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
