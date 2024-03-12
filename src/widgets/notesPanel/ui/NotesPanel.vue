<template>
  <Carousel :value="notes" :num-visible="5" :num-scroll="5">
    <template #item="slotProps">
      <MetadataCard :note="slotProps.data" />
    </template>
  </Carousel>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import { useStore } from "vuex";

import MetadataCard from "@/entities/chartMetadataCard/metadataCard.vue";
import Carousel from "primevue/carousel";
import { Note } from "@/shared/interfaces/Annotations";

interface Props {
  notes: Note[];
}

const props = defineProps<Props>();
const store = useStore();

const notes = computed(() => {
  const selectionId = store.getters.getSelectedRectangle?.item?.id;
  return props.notes.filter((note) => note.selection === selectionId);
});
</script>

<style scoped></style>
