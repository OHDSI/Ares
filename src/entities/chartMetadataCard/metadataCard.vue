<template>
  <v-card
    class="ma-2 card"
    max-width="400"
    max-height="300"
    elevation="5"
    :title="props.title"
  >
    <v-card-text class="text-h7 py-2">
      {{ props.description }}
    </v-card-text>

    <v-card-actions class="justify-space-between">
      <v-btn @click="editCard" class="me-1">Edit</v-btn>

      <v-btn @click="deleteCard" class="me-1">Delete</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import {
  DELETE_NOTE,
  EDIT_NOTE,
  SHOW_DIALOG,
} from "@/widgets/notesPanel/model/store/actions.type";
import { useStore } from "vuex";

const store = useStore();

interface Props {
  title: string;
  description: string;
  id: number;
}

const deleteCard = function () {
  store.dispatch(DELETE_NOTE, { cardId: props.id });
};

const editCard = function () {
  const action = function (title, description) {
    store.dispatch(EDIT_NOTE, {
      cardId: props.id,
      data: { title, description },
    });
  };
  store.dispatch(SHOW_DIALOG, {
    show: true,
    data: {
      title: props.title,
      description: props.description,
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
