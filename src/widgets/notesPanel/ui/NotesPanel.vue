<template>
  <v-row dense class="bg-message justify-space-between">
    <v-col cols="auto">
      <v-card-title class="font-weight-bold">Notes</v-card-title>
    </v-col>
    <v-col cols="auto">
      <v-switch inset hide-details color="primary" v-model="showAllMode">
        <template v-slot:label>
          All notes ({{ allNotes.length }}):
          {{ showAllMode ? "On" : "Off" }}
        </template>
      </v-switch>
    </v-col>
  </v-row>
  <v-slide-group
    v-if="!showAllMode"
    v-model="model"
    class="pa-4"
    show-arrows="always"
  >
    <v-slide-group-item v-for="note in notes" :key="note.title">
      <MetadataCard :note="note" :key="note.id" class="mb-2 elevation-1" />
    </v-slide-group-item>
  </v-slide-group>
  <v-slide-group v-else v-model="model" class="pa-4" show-arrows="always">
    <v-slide-group-item v-for="note in allNotes" :key="note.title">
      <MetadataCard :note="note" :key="note.id" class="mb-2 elevation-1" />
    </v-slide-group-item>
  </v-slide-group>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref } from "vue";
import MetadataCard from "@/entities/chartMetadataCard/metadataCard.vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const route = useRoute();

interface Props {
  report: string;
}

const props = defineProps<Props>();

import { computed } from "vue";
import _ from "lodash";

const store = useStore();

const model = ref(null);
const showAllMode = ref(false);

onMounted(() => {
  showAllMode.value = store.getters.getSettings.allNotesMode;
});

const { cdm, release, domain, concept } = route.params;
const path = [cdm, release, domain, concept, props.report].filter(Boolean);

const notes = computed(() => {
  const selections = _.get(store.getters.getNotes, path.join(".")) || [];
  const selectionId = store.getters.getSelectedRectangle?.item?.id;
  return selections
    .filter((value) => value.id === selectionId)?.[0]
    ?.notes.map((note) => ({
      ...note,
      report: props.report,
      selection: selectionId,
    }));
});

const allNotes = computed(() => {
  const selections = _.get(store.getters.getNotes, path.join(".")) || [];
  return selections.reduce((acc, current) => {
    return [
      ...acc,
      ...current.notes.map((note) => ({
        ...note,
        report: props.report,
        selection: current.id,
      })),
    ];
  }, []);
});
</script>

<style scoped></style>
