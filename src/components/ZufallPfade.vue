<script setup lang="ts">
// Übung zur 2. Pfadregel: Pfade im Baum anklicken (Enden sind Knöpfe), P(E) eintragen. Gelöst: die Pfade von E orange,
// mit Pfadwahrscheinlichkeiten.
import { computed, ref } from "vue";
import ZufallAntwort from "./ZufallAntwort.vue";
import ZufallBaum from "./ZufallBaum.vue";
import { check, generate, grund, weg } from "./ZufallPfade.ts";

const props = defineProps<{ seed: number; art?: "pfadregel" | "uebersetzen" }>();
const emit = defineEmits<{ answered: [ergebnis: { correct: boolean; reason: string }] }>();
const aufgabe = computed(() => generate(props.seed, props.art === undefined ? {} : { art: props.art }));
const auswahl = ref<string[]>([]);
const geloest = ref(false);

function umschalten(pfad: string) {
  auswahl.value = auswahl.value.includes(pfad) ? auswahl.value.filter((p) => p !== pfad) : [...auswahl.value, pfad];
}

function pruefen(werte: Record<string, string>) {
  const antwort = { antwort: werte["antwort"] ?? "", auswahl: auswahl.value };
  geloest.value = check(aufgabe.value, antwort);
  emit("answered", { correct: geloest.value, reason: grund(aufgabe.value, antwort) });
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
      @pruefen="pruefen"
    />
  </div>
</template>
