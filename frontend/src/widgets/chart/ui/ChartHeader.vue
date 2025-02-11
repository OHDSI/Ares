<template>
  <div class="flex flex-row">
    <div class="flex flex-row gap-1">
      <ToggleIcon
        v-if="props.tableToggle"
        :icon="mdiTable"
        show-state
        tooltip="Toggle table view"
        :default-state="false"
        @iconClicked="toggleTable"
      />
    </div>

    <div class="flex flex-row gap-1">
      <ToggleIcon
        v-if="props.notesCount !== undefined"
        :icon="mdiNoteText"
        tooltip="Toggle Notes"
        :count="props.notesCount"
        show-state
        :default-state="store.getters.getSettings.notesMode"
        @iconClicked="toggleNotesMode"
      />
      <ToggleIcon
        v-if="props.annotationsCount !== undefined"
        :icon="mdiSelectionMarker"
        tooltip="Toggle Annotations"
        :count="props.annotationsCount"
        show-state
        :default-state="store.getters.getSettings.annotationsMode"
        @iconClicked="toggleAnnotationMode"
      />
    </div>

    <slot></slot>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { onMounted } from "vue";
import { useStore } from "vuex";
import ToggleIcon from "@/entities/toggleIcon/ToggleIcon.vue";

const annotationMode = ref(false);
const noteMode = ref(false);
const store = useStore();
import { mdiSelectionMarker, mdiNoteText, mdiTable } from "@mdi/js";

interface Props {
  notesCount?: number;
  annotationsCount?: number;
  issueCount?: number;
  tableToggle?: boolean;
}

const props = defineProps<Props>();

const emits = defineEmits([
  "annotationsModeToggled",
  "notesModeToggled",
  "tableToggled",
]);

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

function toggleTable(val) {
  emits("tableToggled", val);
}
</script>

<style scoped></style>
