<template>
  <v-row justify="space-between" class="mb-2">
    <v-col v-if="title" cols="auto">
      <v-card-title v-if="title">{{ title }}</v-card-title>
    </v-col>
    <v-col v-if="props.notesCount !== undefined" cols="auto">
      <v-switch inset color="primary" hide-details v-model="annotationMode">
        <template v-slot:label>
          Annotations ({{ props.notesCount }}):
          {{ annotationMode ? "On" : "Off" }}
        </template>
      </v-switch>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import { onMounted } from "vue";
import { useStore } from "vuex";

const annotationMode = ref(false);
const store = useStore();

interface Props {
  notesCount?: string;
  title?: string;
}

const props = defineProps<Props>();

const emit = defineEmits(["modeToggled"]);

onMounted(() => {
  annotationMode.value = store.getters.getSettings.annotationsMode;
});

watch(annotationMode, () => {
  emit("modeToggled", annotationMode.value);
});
</script>

<style scoped></style>
