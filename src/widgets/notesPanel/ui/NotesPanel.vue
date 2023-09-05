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

interface Props {
  notes: [];
}

const props = defineProps<Props>();

import { computed } from "vue";

const store = useStore();

const model = ref(null);
const showAllMode = ref(false);

onMounted(() => {
  showAllMode.value = store.getters.getSettings.allNotesMode;
});

const notes = computed(() => {
  const selectionId = store.getters.getSelectedRectangle?.item?.id;
  return props.notes.filter((note) => note.selection === selectionId);
});

const allNotes = computed(() => {
  return props.notes;
});
</script>

<style scoped></style>
