<template>
  <Dialog
    :pt="{
      root: { class: 'h-[520px] w-[850px]' },
    }"
    :header="formTitle"
    unstyled
    modal
    v-model:visible="sh"
  >
    <div class="h-full relative">
      <div class="p-6">
        <div class="flex flex-row h-full gap-20 p-3">
          <div class="flex flex-col gap-3" style="flex: 1">
            <h3 class="text-center font-bold text-xl">Selection</h3>
            <div class="flex flex-col gap-7">
              <InputText
                placeholder="Title"
                size="small"
                v-model="currentSelection.title"
              />
              <Textarea
                placeholder="Description"
                auto-resize
                rows="9"
                v-model="currentSelection.description"
              />
            </div>
          </div>
          <div class="flex flex-col gap-3" style="flex: 1">
            <h3 class="text-center font-bold text-xl">Notes</h3>
            <div class="flex flex-col gap-3 mx-1">
              <Button plain size="block" variant="flat" @click="addNote">
                <div class="newNote align-center">
                  <svg-icon type="mdi" :path="mdiPlusThick"></svg-icon>
                  <span>Add new note</span>
                </div>
              </Button>
              <div class="flex flex-col gap-3 overflow-auto mt-1 p-2 h-[280px]">
                <metadata-card
                  @delete-card="removeNote"
                  @edit-card="editNote"
                  edit
                  v-for="note in currentSelection.notes"
                  :note="note"
                  :key="note.id"
                ></metadata-card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-row justify-between w-full absolute bottom-0">
        <Button text severity="danger" size="large" @click="cancel"
          >CANCEL</Button
        >
        <Button text severity="info" size="large" @click="submit">SAVE</Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed, onBeforeMount } from "vue";
import MetadataCard from "@/entities/chartMetadataCard/metadataCard.vue";
import { useStore } from "vuex";
import { createSelection } from "@/widgets/selectionEditDialog/lib/lib";
import { SET_SELECTED_RECTANGLE } from "@/widgets/notesPanel/model/store/mutations.type";
import Dialog from "primevue/dialog";
import Textarea from "primevue/textarea";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { mdiPlusThick } from "@mdi/js";
import SvgIcon from "@jamescoyle/vue-icon";

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
    : createSelection(store.getters.getDialogData.position, {
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
  store.commit(SET_SELECTED_RECTANGLE, null);
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
  text-transform: uppercase;
}
</style>
