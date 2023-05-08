б
<template>
  <div>
    <v-slide-group v-model="model" class="pa-4" show-arrows="always">
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
import _ from "lodash";

const store = useStore();

const model = ref(null);

const notes = computed(() => {
  const { cdm, release, domain, concept } = route.params;
  const path = [cdm, release, domain, concept, props.report].filter(Boolean);
  const selections = _.get(store.getters.getNotes, path.join(".")) || [];
  const selectionId = store.getters.getSelectedRectangle?.item.id;
  return selections.filter((value) => value.id === selectionId)?.[0]?.notes;
});
</script>

<style scoped></style>
