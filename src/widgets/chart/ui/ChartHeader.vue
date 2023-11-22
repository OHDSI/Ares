<template>
  <div class="flex flex-row gap-1">
    <ChartActionIcon
      v-if="props.notesCount !== undefined"
      :icon="mdiNoteText"
      tooltip="Toggle Notes"
      :count="props.notesCount"
      show-state
      :default-state="store.getters.getSettings.notesMode"
      @iconClicked="toggleNotesMode"
    />
    <ChartActionIcon
      v-if="props.annotationsCount !== undefined"
      :icon="mdiSelectionMarker"
      tooltip="Toggle Annotations"
      :count="props.annotationsCount"
      show-state
      :default-state="store.getters.getSettings.annotationsMode"
      @iconClicked="toggleAnnotationMode"
    />
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";
import { onMounted } from "vue";
import { useStore } from "vuex";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const annotationMode = ref(false);
const noteMode = ref(false);
const store = useStore();
import { mdiSelectionMarker, mdiNoteText } from "@mdi/js";

interface Props {
  notesCount?: number;
  annotationsCount?: number;
  issueCount?: number;
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
  console.log(val);
}

/*watch(annotationMode, () => {
  emits("annotationsModeToggled", annotationMode.value);
});*/
/*watch(noteMode, () => {
  emits("notesModeToggled", noteMode.value);
});*/
</script>

<style scoped></style>
