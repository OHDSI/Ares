<template>
  <v-card
    v-if="!props.edit"
    class="ma-2 card"
    max-width="400"
    max-height="300"
    elevation="5"
  >
    <v-layout class="justify-space-between">
      <v-card-title class="justify-space-between">
        {{ props.note.title }}
      </v-card-title>
      <v-btn variant="plain" icon>
        <v-icon> mdi-information-outline </v-icon>
        <v-tooltip
          content-class="custom-tooltip"
          activator="parent"
          location="end"
        >
          Created by {{ user || "unknown" }} at {{ dateTimeCreated }}
          <br />
          Last updated at {{ dateTimeUpdated }}</v-tooltip
        ></v-btn
      >
    </v-layout>
    <v-card-text class="text-h7 py-2">
      <Markdown
        v-if="props.note.description"
        html
        breaks
        :source="props.note.description"
      ></Markdown>
      <!--      {{ props.note.description }}-->
    </v-card-text>
    <v-divider></v-divider>
  </v-card>
  <v-card v-else class="mb-2 card" width="400" elevation="6">
    <v-card-title>
      <v-text-field
        density="compact"
        label="Title"
        hide-details
        variant="underlined"
        v-model="currentCard.title"
        @update:modelValue="editCard()"
      ></v-text-field>
    </v-card-title>
    <v-card-text class="text-h8 py-2">
      <Codemirror
        :style="{ height: '150px' }"
        v-model="currentCard.description"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="extensions"
        @update:modelValue="editCard()"
      ></Codemirror>
    </v-card-text>

    <v-card-actions class="justify-space-between">
      <v-btn block @click="confirmDelete = true" color="info" class="me-1"
        >Delete</v-btn
      >
    </v-card-actions>
  </v-card>
  <div class="text-center">
    <v-dialog v-model="confirmDelete" width="auto">
      <v-card>
        <v-card-text> Are you sure you want to delete this note? </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn color="primary" @click="confirmDelete = false">Cancel</v-btn>
          <v-btn color="error" @click="deleteCard">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, defineEmits, onBeforeMount, computed } from "vue";
import { useStore } from "vuex";
import { Codemirror } from "vue-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import Markdown from "vue3-markdown-it";

const emit = defineEmits(["editCard", "deleteCard"]);

const store = useStore();
const extensions = [markdown(), oneDark];

interface Note {
  title: string;
  description: string;
  id: number;
  lastUpdated: number;
  report?: string;
  selection?: string;
  createdBy: string;
}

interface Props {
  note: Note;
  edit?: boolean;
}

const dateTimeCreated = computed(() => {
  const isoDate = new Date(props.note.id);
  return isoDate.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
});

const dateTimeUpdated = computed(() => {
  if (props.note.lastUpdated) {
    const isoDate = new Date(props.note.lastUpdated);
    return isoDate.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } else {
    return dateTimeCreated.value;
  }
});

const user = computed(() => {
  return props.note.createdBy;
});

const currentCard = ref(null);

onBeforeMount(() => {
  currentCard.value = { ...props.note };
});

const deleteCard = function () {
  emit("deleteCard", props.note.id);
};

const editCard = function () {
  emit("editCard", { ...currentCard.value, lastUpdated: Date.now() });
};

const confirmDelete = ref(false);

const props = defineProps<Props>();
</script>

<style lang="scss">
.card {
  display: flex;
  align-content: space-between;
  flex-direction: column;
}

.cm-editor {
  background-color: rgba(var(--v-theme-surface));
}
.cm-gutters {
  background-color: rgba(var(--v-theme-accent)) !important;
}
</style>
