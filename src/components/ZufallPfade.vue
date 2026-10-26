<script setup lang="ts">
// Übung zur 2. Pfadregel: Pfade im Baum anklicken (Enden sind Knöpfe), P(E) eintragen. Geprüft und richtig: die Pfade
// von E orange, mit Pfadwahrscheinlichkeiten. Die Übung ist die Eingabe der Aufgabe: Sie gibt P(E) und die
// angeklickten Pfade mit answer weiter, sobald P(E) etwas hat; „Prüfen“ und die Rückmeldung kommen vom explainer
// (ZufallPfade.ts).
import { computed, ref } from "vue";
import ZufallAntwort from "./ZufallAntwort.vue";
import ZufallBaum from "./ZufallBaum.vue";
import { type PfadeAntwort, check, generate, weg } from "./ZufallPfade.ts";

const props = defineProps<{ seed: number; art?: "pfadregel" | "uebersetzen"; checked: boolean }>();
const emit = defineEmits<{ answer: [antwort: PfadeAntwort | undefined] }>();
const aufgabe = computed(() => generate(props.seed, props.art === undefined ? {} : { art: props.art }));
const auswahl = ref<string[]>([]);
const wert = ref<string | undefined>(undefined);
const antwort = computed(() =>
  wert.value === undefined ? undefined : { antwort: wert.value, auswahl: [...auswahl.value] },
);
const geloest = computed(() => props.checked && antwort.value !== undefined && check(aufgabe.value, antwort.value));

function umschalten(pfad: string) {
  auswahl.value = auswahl.value.includes(pfad) ? auswahl.value.filter((p) => p !== pfad) : [...auswahl.value, pfad];
  if (wert.value !== undefined) emit("answer", antwort.value);
}

function eingabe(werte: Record<string, string> | undefined) {
  wert.value = werte?.["antwort"];
  emit("answer", antwort.value);
}
</script>

<template>
  <div class="question">
    <p>{{ aufgabe.text }}</p>
    <p v-if="!geloest" class="question-hint">Klick auf das Ende eines Pfades, um ihn auszuwählen.</p>
    <ZufallBaum
      :titel="
        geloest
          ? `Baumdiagramm; orange: die Pfade von „${aufgabe.name}“`
          : 'Baumdiagramm – klick auf das Ende eines Pfades, um ihn auszuwählen'
      "
      :experiment="aufgabe.experiment"
      :urne="aufgabe.urne"
      :zuege="aufgabe.zuege"
      :modus="aufgabe.mit ? 'mit' : 'ohne'"
      :hervor="geloest ? aufgabe.pfade : []"
      :auswahl="geloest ? [] : auswahl"
      :waehlbar="!geloest"
      :zeige-pfad="geloest"
      @umschalten="umschalten"
    />
    <ZufallAntwort
      :felder="[{ id: 'antwort', label: 'P(E) =' }]"
      :weg="weg(aufgabe)"
      :geloest="geloest"
      :versucht="checked"
      @eingabe="eingabe"
    />
  </div>
</template>
