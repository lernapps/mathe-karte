<script setup lang="ts">
// Die Eingabe einer Prozent-Aufgabe: Text, Bild zur Aufgabe, Felder. Sie meldet jede Änderung der Felder mit eingabe
// (undefined, solange alle leer sind); die Übung der Seite (ProzentProzentwert.vue und die anderen) gibt sie als
// answer weiter, und der explainer zeichnet „Prüfen“ darunter. Nach einer geprüften falschen Antwort (checked) zeigt
// sie den Tipp und „Lösung zeigen“ (Rechenweg und das gelöste Bild), nach einer richtigen das gelöste Bild. Kein Block.
import { computed, reactive, ref, useId, watch } from "vue";
import ProzentBild from "./ProzentBild.vue";
import { type Antworten, type Aufgabe, check, hatEingabe } from "./ProzentAufgabe.ts";

// aufgabe ist eine Aufgabe aus ProzentAufgabe.ts; als unknown deklariert, weil der Build nur Prop-Typen liest, die ein
// Block aus YAML geben kann. Die Übungen geben immer generate(seed).
const props = defineProps<{ aufgabe: unknown; checked: boolean }>();
const emit = defineEmits<{ eingabe: [antworten: Antworten | undefined] }>();
const aufgabe = computed(() => props.aufgabe as Aufgabe);
const name = useId();

const antworten = reactive<Antworten>(Object.fromEntries(aufgabe.value.felder.map((feld) => [feld.id, ""])));
const loesungOffen = ref(false);
// einmal geprüft, bleibt „Lösung zeigen“, auch wenn das Kind die Antwort danach ändert
const geprueft = ref(false);
watch(
  () => props.checked,
  (jetzt) => {
    if (jetzt) geprueft.value = true;
  },
);
// geprüft und richtig: die Übung prüft selbst, um das gelöste Bild zu zeigen; die Rückmeldung gibt der explainer
const richtig = computed(() => props.checked && check(aufgabe.value, antworten));
const geloest = computed(() => richtig.value || loesungOffen.value);

watch(antworten, () => emit("eingabe", hatEingabe(antworten) ? { ...antworten } : undefined));
</script>

<template>
  <div class="question prozent-uebung">
    <p class="prozent-text">{{ aufgabe.text }}</p>
    <figure class="prozent-bild">
      <ProzentBild :bild="geloest ? aufgabe.bildGeloest : aufgabe.bild" />
      <figcaption>Bild zur Aufgabe</figcaption>
    </figure>
    <div class="prozent-felder">
      <template v-for="feld in aufgabe.felder" :key="feld.id">
        <p v-if="feld.typ === 'zahl'" class="question-number prozent-feld">
          <label>
            <span class="prozent-label">{{ feld.label }}</span>
            <span class="prozent-eingabe">
              <input v-model="antworten[feld.id]" type="text" inputmode="decimal" autocomplete="off" />
              <span v-if="feld.einheit">{{ feld.einheit }}</span>
            </span>
            <span v-if="feld.hinweis" class="question-hint prozent-hinweis">{{ feld.hinweis }}</span>
          </label>
        </p>
        <p v-else-if="feld.typ === 'auswahl'" class="question-pairs prozent-feld">
          <label>
            <span class="prozent-label">{{ feld.label }}</span>
            <select v-model="antworten[feld.id]">
              <option value="">– bitte wählen –</option>
              <option v-for="option in feld.optionen" :key="option.wert" :value="option.wert">{{ option.text }}</option>
            </select>
          </label>
        </p>
        <fieldset v-else class="prozent-feld">
          <legend>{{ feld.label }}</legend>
          <label v-for="option in feld.optionen" :key="option.wert" class="question-option">
            <input v-model="antworten[feld.id]" type="radio" :name="`${name}-${feld.id}`" :value="option.wert" />
            {{ option.text }}
          </label>
        </fieldset>
      </template>
      <p v-if="geprueft && !geloest" class="question-actions">
        <button type="button" class="question-solve" @click="loesungOffen = true">Lösung zeigen</button>
      </p>
    </div>
    <p v-if="checked && !geloest" class="prozent-tipp"><strong>Tipp:</strong> {{ aufgabe.tipp }}</p>
    <div v-if="geloest" class="prozent-loesung">
      <p v-if="loesungOffen && !richtig">{{ aufgabe.richtig }}</p>
      <p>Rechenweg:</p>
      <ul>
        <li v-for="(zeile, i) in aufgabe.rechenweg" :key="i">{{ zeile }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.prozent-bild {
  margin: 0.75rem 0;
}
.prozent-bild figcaption {
  color: var(--page-muted, #4a4a4a);
  font-size: 0.9rem;
}
.prozent-feld label {
  display: block;
}
.prozent-label {
  display: block;
  margin-bottom: 0.25rem;
}
.prozent-eingabe {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  max-width: 100%;
}
.prozent-eingabe input {
  min-width: 0;
  max-width: 12rem;
}
.prozent-feld select {
  max-width: 100%;
}
.prozent-hinweis {
  display: block;
}
.prozent-feld + .prozent-feld {
  margin-top: 0.75rem;
}
fieldset.prozent-feld {
  border: none;
  margin: 0.75rem 0 0;
  padding: 0;
}
</style>
