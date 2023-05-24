<template>
  <v-card
    class="ma-2 card"
    max-width="400"
    max-height="300"
    elevation="5"
    :title="props.note.title"
  >
    <v-card-text class="text-h7 py-2">
      {{ props.note.description }}
    </v-card-text>

    <v-card-actions class="justify-space-between">
      <v-btn @click="editCard" class="me-1">Edit</v-btn>

      <v-btn @click="confirmDelete = true" class="me-1">Delete</v-btn>
    </v-card-actions>
  </v-card>
  <div class="text-center">
    <v-dialog v-model="confirmDelete" width="auto">
      <v-card>
        <v-card-text> Are you sure you want to delete this note? </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn color="primary" @click="confirmDelete = false">Cancel</v-btn>
          <v-btn color="primary" @click="deleteCard">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import {
  DELETE_NOTE,
  EDIT_NOTE,
  SHOW_DIALOG,
} from "@/widgets/notesPanel/model/store/actions.type";
import { useStore } from "vuex";

const store = useStore();

interface Note {
  title: string;
  description: string;
  id: number;
  report?: string;
  selection?: string;
}

interface Props {
  note: Note;
}

const deleteCard = function () {
  store.dispatch(DELETE_NOTE, {
    cardId: props.note.id,
    report: props.note.report,
    selection: props.note.selection,
  });
  confirmDelete.value = false;
};

const confirmDelete = ref(false);

const editCard = function () {
  const action = function (title, description, selection, report) {
    store.dispatch(EDIT_NOTE, {
      cardId: props.note.id,
      data: { title, description, selection, report },
    });
  };
  store.dispatch(SHOW_DIALOG, {
    show: true,
    data: {
      title: props.note.title,
      description: props.note.description,
      selection: props.note.selection,
      report: props.note.report,
    },
    action,
  });
};

const props = defineProps<Props>();
</script>

<style scoped>
.card {
  display: flex;
  align-content: space-between;
  flex-direction: column;
}
</style>
