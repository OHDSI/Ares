<template>
  <v-toolbar density="compact" class="mb-6">
    <v-card-title v-if="title">{{ title }}</v-card-title>
    <v-spacer></v-spacer>
    <ChartActionIcon
      v-if="props.notesCount !== undefined"
      icon="mdi-note-text"
      tooltip="Toggle Notes"
      :count="props.notesCount"
      show-state
      :default-state="store.getters.getSettings.notesMode"
      @iconClicked="toggleNotesMode"
    />
    <ChartActionIcon
      v-if="props.annotationsCount !== undefined"
      icon="mdi-selection-marker"
      tooltip="Toggle Annotations"
      :count="props.annotationsCount"
      show-state
      :default-state="store.getters.getSettings.annotationsMode"
      @iconClicked="toggleAnnotationMode"
    />
    <slot></slot>
  </v-toolbar>
</template>
<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import { links } from "@/shared/config/links";
import { onMounted } from "vue";
import { useStore } from "vuex";
import { TOGGLE_DEFAULT_ANNOTATIONS_MODE } from "@/widgets/settings/model/store/actions.type";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const annotationMode = ref(false);
const noteMode = ref(false);
const store = useStore();

interface Props {
  notesCount?: number;
  annotationsCount?: number;
  issueCount?: number;
  title?: string;
}

const props = defineProps<Props>();

const emits = defineEmits(["annotationsModeToggled", "notesModeToggled"]);

onMounted(() => {
  annotationMode.value = store.getters.getSettings.annotationsMode;
  noteMode.value = store.getters.getSettings.notesMode;
});

function toggleAnnotationMode(val) {
  emits("annotationsModeToggled", val);
}

function toggleNotesMode(val) {
  emits("notesModeToggled", val);
}

/*watch(annotationMode, () => {
  emits("annotationsModeToggled", annotationMode.value);
});*/
/*watch(noteMode, () => {
  emits("notesModeToggled", noteMode.value);
});*/
</script>

<style scoped></style>
