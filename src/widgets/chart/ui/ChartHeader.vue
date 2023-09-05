<template>
  <v-toolbar density="compact" class="mb-6">
    <v-card-title v-if="title">{{ title }}</v-card-title>
    <v-spacer></v-spacer>
    <v-btn v-if="props.notesCount !== undefined" icon density="comfortable" @click="noteMode = !noteMode">
      <v-badge :content=props.notesCount :color="noteMode ? 'primary' : 'default'">
        <v-icon :color="noteMode ? 'primary' : 'default'">mdi-note-text</v-icon>
      </v-badge>
      <v-tooltip activator="parent" location="top">Toggle Notes</v-tooltip>
    </v-btn>
    <v-btn v-if="props.annotationsCount !== undefined" icon density="comfortable" @click="annotationMode = !annotationMode">
      <v-badge :content=props.annotationsCount :color="annotationMode ? 'primary' : 'default'">
        <v-icon :color="annotationMode ? 'primary' : 'default'">mdi-selection-marker</v-icon>
      </v-badge>
      <v-tooltip activator="parent" location="top">Toggle Annotations</v-tooltip>
    </v-btn>
    <v-btn v-if="store.getters.getQueryIndex" icon density="comfortable" target="_blank" :link-details="true" :href="links.getSqlQueryLink(
      store.getters.getQueryIndex.PERSON.AGE_GENDER_DATA
    )
      ">
      <v-icon>mdi-database-search</v-icon>
      <v-tooltip activator="parent" location="top">View Export Query</v-tooltip>
    </v-btn>
  </v-toolbar>
</template>
<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import { links } from "@/shared/config/links";
import { onMounted } from "vue";
import { useStore } from "vuex";
import { TOGGLE_DEFAULT_ANNOTATIONS_MODE } from "@/widgets/settings/model/store/actions.type";

const annotationMode = ref(false);
const noteMode = ref(false);
const store = useStore();

interface Props {
  notesCount?: number;
  annotationsCount?: number;
  title?: string;
}

const props = defineProps<Props>();

const emits = defineEmits(["annotationsModeToggled", "notesModeToggled"]);

onMounted(() => {
  annotationMode.value = store.getters.getSettings.annotationsMode;
  noteMode.value = store.getters.getSettings.notesMode;
});

watch(annotationMode, () => {
  emits("annotationsModeToggled", annotationMode.value);
});
watch(noteMode, () => {
  emits("notesModeToggled", noteMode.value);
});
</script>

<style scoped></style>
