<template>
  <div v-if="props.show" class="text-center">
    <v-dialog v-if="sh" v-model="sh" width="auto">
      <v-card width="900" height="550">
        <v-card-title class="bg-blue px-5 text-center">{{
          formTitle
        }}</v-card-title>
        <v-row justify="space-evenly" class="pa-2">
          <v-col cols="5">
            <v-card class="pa-2" elevation="0">
              <v-card-title class="text-center"> Selection </v-card-title>
              <v-text-field
                :rules="[rules.required]"
                label="Title"
                variant="outlined"
                v-model="currentSelection.title"
              ></v-text-field>
              <v-textarea
                auto-grow
                variant="outlined"
                v-model="currentSelection.description"
                label="Description"
                rows="9"
                placeholder="optional"
                counter
              ></v-textarea>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card max-height="400" class="pa-2 overflow-auto" elevation="0">
              <v-card-title class="text-center"> Notes </v-card-title>

              <v-card variant="outlined" color="info" class="mb-2" width="400">
                <v-layout class="justify-center">
                  <v-btn block variant="flat" @click="addNote">
                    <v-layout class="newNote align-center">
                      <v-icon size="20"> mdi-plus-thick </v-icon>
                      <span>Add new note</span>
                    </v-layout>
                  </v-btn>
                </v-layout>
              </v-card>

              <metadata-card
                @delete-card="removeNote"
                @edit-card="editNote"
                edit
                v-for="note in currentSelection.notes"
                :note="note"
                :key="note.id"
              ></metadata-card>
            </v-card>
          </v-col>
        </v-row>
        <v-card-actions class="justify-space-between">
          <v-btn color="error" @click="cancel">Cancel</v-btn>
          <v-btn @click="submit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed, onBeforeMount } from "vue";
import MetadataCard from "@/entities/chartMetadataCard/metadataCard.vue";
import { useStore } from "vuex";
import { createSelection } from "@/widgets/selectionEditDialog/lib/lib";
interface Props {
  action: (a) => void;
  data?: {
    title: string;
    description: string;
    selection: object;
    report: string;
  };
  formTitle?: string;
  show: boolean;
}

const props = defineProps<Props>();

const store = useStore();

const sh = computed({
  get: function () {
    return props.show;
  },
  set: function () {
    emit("close");
  },
});

const currentSelection = ref({
  title: "",
  description: "",
  notes: [],
});

const storeSelection = computed(() => {
  return store.getters.getSelectedRectangle?.item || {};
});

const removeNote = function (id) {
  currentSelection.value = {
    ...currentSelection.value,
    notes: currentSelection.value.notes.filter((note) => note.id !== id),
  };
};

const addNote = function () {
  currentSelection.value.notes = [
    {
      title: "",
      description: "",
      id: Date.now(),
      createdBy:
        store.getters.getWebApiUser?.name ||
        store.getters.getSettings.user?.name ||
        "unknown",
    },
    ...currentSelection.value.notes,
  ];
};

const editNote = function (event) {
  const selectionIndex = currentSelection.value.notes.findIndex(
    (selection) => selection.id === event.id
  );
  if (selectionIndex !== -1) {
    const updatedNotes = [...currentSelection.value.notes];
    updatedNotes[selectionIndex] = event;
    currentSelection.value.notes = updatedNotes;
  }
};

onBeforeMount(() => {
  currentSelection.value = Object.keys(storeSelection.value).length
    ? { ...storeSelection.value, updatedAt: Date.now() }
    : createSelection(store.getters.getCurrentSelectionArea.event, {
        title: "",
        description: "",
        notes: [],
        createdBy:
          store.getters.getWebApiUser?.name ||
          store.getters.getSettings.user?.name ||
          "unknown",
      });
});

const emit = defineEmits(["close"]);

function submit() {
  props.action(currentSelection.value);
  emit("close");
}

function cancel() {
  emit("close");
}

const rules = {
  required: (value) => !!value || "Required field",
};
</script>

<style scoped>
.newNote {
  display: flex;
  flex-direction: row;
  gap: 1%;
}
</style>
