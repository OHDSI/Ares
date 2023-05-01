<template>
  <div>
    <v-slide-group v-model="model" class="pa-4" show-arrows>
      <v-slide-group-item v-for="note in notes" :key="note.title">
        <MetadataCard
          :title="note.title"
          :description="note.description"
          :id="note.id"
          :key="note.title"
        >
        </MetadataCard>
      </v-slide-group-item>
    </v-slide-group>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import MetadataCard from "@/entities/chartMetadataCard/metadataCard.vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const route = useRoute();

interface Props {
  report: string;
}

const props = defineProps<Props>();

import { computed } from "vue";

const store = useStore();

const model = ref(null);

const notes = computed(() => {
  const sourceName = route.params.cdm;
  const releaseName = route.params.release;
  const selectionId = store.getters.getSelectedRectangle?.item.id;
  const data =
    store.getters.getNotes[sourceName]?.[releaseName]?.[props.report] || [];
  return data.filter((value) => value.id === selectionId)?.[0]?.notes;
});
</script>

<style scoped></style>
