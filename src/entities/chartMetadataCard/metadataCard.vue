<template>
  <v-card
    v-if="!props.edit"
    class="ma-2 card"
    max-width="400"
    max-height="300"
    elevation="5"
    :title="props.note.title"
  >
    <v-card-text class="text-h7 py-2">
      {{ props.note.description }}
    </v-card-text>
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
      <v-textarea
        label="Description"
        variant="plain"
        hide-details
        density="compact"
        v-model="currentCard.description"
        @update:modelValue="editCard()"
      ></v-textarea>
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
import { defineProps, ref, defineEmits, onBeforeMount } from "vue";

const emit = defineEmits(["editCard", "deleteCard"]);

interface Note {
  title: string;
  description: string;
  id: number;
  report?: string;
  selection?: string;
}

interface Props {
  note: Note;
  edit?: boolean;
}

const currentCard = ref(null);

onBeforeMount(() => {
  currentCard.value = { ...props.note };
});

const deleteCard = function () {
  emit("deleteCard", props.note.id);
};

const editCard = function () {
  emit("editCard", currentCard.value);
};

const confirmDelete = ref(false);

const props = defineProps<Props>();
</script>

<style scoped>
.card {
  display: flex;
  align-content: space-between;
  flex-direction: column;
}
</style>
