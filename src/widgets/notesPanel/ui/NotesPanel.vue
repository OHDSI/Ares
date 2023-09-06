<template>
  <v-slide-group v-if="!showAllMode" v-model="model" class="pa-4" show-arrows="always">
    <v-slide-group-item v-if="notes.length == 0">
      No Notes
    </v-slide-group-item>    
    <v-slide-group-item v-for="note in notes" :key="note.title">
      <MetadataCard :note="note" :key="note.id" class="mb-2 elevation-1" />
    </v-slide-group-item>
  </v-slide-group>
  <v-slide-group v-else v-model="model" class="pa-4" show-arrows="always">
    <v-slide-group-item v-if="notes.length == 0">
      No Notes
    </v-slide-group-item>    
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
const showAllMode = ref(true);

import { computed } from "vue";

const store = useStore();

const model = ref(null);

const notes = computed(() => {
  const selectionId = store.getters.getSelectedRectangle?.item?.id;
  return props.notes.filter((note) => note.selection === selectionId);
});

const allNotes = computed(() => {
  return props.notes;
});
</script>

<style scoped></style>
