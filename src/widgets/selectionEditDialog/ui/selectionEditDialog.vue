<template>
  <Dialog
    :pt="{
      root: { class: 'h-[630px] w-[850px]' },
    }"
    :header="formTitle"
    unstyled
    modal
    v-model:visible="renderDialog"
  >
    <div class="h-full relative">
      <div class="p-6">
        <div class="flex flex-row h-full gap-20 p-3">
          <div class="flex flex-col gap-3" style="flex: 1">
            <h3 class="text-center font-bold text-xl">Selection</h3>
            <div class="flex flex-col gap-3">
              <InputText
                placeholder="Title"
                size="small"
                v-model="openedSelection.body.title"
              />
              <Textarea
                placeholder="Description"
                auto-resize
                rows="9"
                v-model="openedSelection.body.description"
              />
            </div>
            <h3 class="text-center font-bold text-xl">Scope</h3>
            <div class="flex flex-col gap-3 max-w-[355px]">
              <Dropdown
                v-model="openedSelection.metadata.scope.type"
                :options="scopes"
                option-label="title"
                option-value="value"
                @update:modelValue="switchScope"
              />
              <MultiSelect
                class="max-w-[100%]"
                v-model="openedSelection.metadata.scope.value.release"
                :options="getReleases"
                option-label="release_name"
                option-value="release_id"
                v-if="openedSelection.metadata.scope.type === 'releaseList'"
              />
              <MultiSelect
                class="max-w-[100%]"
                v-model="openedSelection.metadata.scope.value.source"
                :options="getSources"
                option-label="cdm_source_name"
                option-value="cdm_source_key"
                v-if="openedSelection.metadata.scope.type === 'sourceList'"
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
              <div class="flex flex-col gap-3 overflow-auto mt-1 p-2 h-[385px]">
                <metadata-card
                  @delete-card="removeNote"
                  @edit-card="editNote"
                  edit
                  v-for="note in openedSelection.body.notes"
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
import { ref, computed, onBeforeMount } from "vue";
import MetadataCard from "@/entities/chartMetadataCard/metadataCard.vue";
import { useStore } from "vuex";
import { createSelection } from "@/widgets/selectionEditDialog/lib/lib";
import { SET_SELECTED_RECTANGLE } from "@/widgets/notesPanel/model/store/mutations.type";
import Dialog from "primevue/dialog";
import Textarea from "primevue/textarea";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import MultiSelect from "primevue/multiselect";
import { mdiPlusThick } from "@mdi/js";
import SvgIcon from "@jamescoyle/vue-icon";
import { useRoute } from "vue-router";
import { v4 as uuid } from "uuid";

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
const route = useRoute();

const store = useStore();

const renderDialog = computed({
  get: function () {
    return props.show;
  },
  set: function () {
    emit("close");
  },
});

const scopes = computed(() =>
  [
    {
      title: "Selected Releases",
      value: "releaseList",
      show: route.params.release,
    },
    { title: "Selected Sources", value: "sourceList", show: route.params.cdm },
    { title: "Concept-wide", value: "conceptID", show: route.params.concept },
  ].filter((val) => val.show)
);
const currentSource = computed(() => {
  return store.getters.getSelectedSource;
});

const getReleases = computed(() => {
  return currentSource.value.releases;
});

const getSources = computed(() => {
  return store.getters.getSources;
});

const currentRelease = computed(() => {
  return store.getters.getSelectedRelease;
});

const openedSelection = ref({
  body: {
    title: "",
    description: "",
    notes: [],
  },
  metadata: {
    scope: { type: null, value: null },
  },
});

function switchScope(val) {
  switch (val) {
    case "releaseList":
      openedSelection.value.metadata.scope.type = "releaseList";
      openedSelection.value.metadata.scope.value = {
        source: [currentSource.value.cdm_source_key],
        release: [currentRelease.value.release_id],
        concept: route.params.concept ? [route.params.concept] : undefined,
      };
      break;
    case "sourceList":
      openedSelection.value.metadata.scope.type = "sourceList";
      openedSelection.value.metadata.scope.value = {
        source: [currentSource.value.cdm_source_key],
        concept: route.params.concept ? [route.params.concept] : undefined,
      };
      break;
    case "conceptID":
      openedSelection.value.metadata.scope.type = "conceptID";
      openedSelection.value.metadata.scope.value = {
        concept: [route.params.concept],
      };
  }
}

const storeSelection = computed(() => {
  return store.getters.getSelectedRectangle?.item || {};
});

const removeNote = function (id) {
  openedSelection.value = {
    ...openedSelection.value,
    body: {
      ...openedSelection.value.body,
      notes: openedSelection.value.body.notes.filter((note) => note.id !== id),
    },
  };
};

const addNote = function () {
  const newNote = {
    title: "",
    description: "",
    id: uuid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy:
      store.getters.getWebApiUser?.name ||
      store.getters.getSettings.user?.name ||
      "unknown",
  };

  openedSelection.value.body.notes = [
    newNote,
    ...openedSelection.value.body.notes,
  ];
};

const editNote = function (event) {
  const selectionIndex = openedSelection.value.body.notes.findIndex(
    (selection) => selection.id === event.id
  );
  if (selectionIndex !== -1) {
    const updatedNotes = [...openedSelection.value.body.notes];
    updatedNotes[selectionIndex] = event;
    openedSelection.value.body.notes = updatedNotes;
  }
};

onBeforeMount(() => {
  const isExistingSelection = Object.keys(storeSelection.value).length;

  if (isExistingSelection) {
    openedSelection.value = storeSelection.value;
  } else {
    const coordinates = store.getters.getDialogData.coordinates;
    const createdBy =
      store.getters.getWebApiUser?.name ||
      store.getters.getSettings.user?.name ||
      "unknown";

    const selectionData = {
      body: {
        title: "",
        description: "",
        notes: [],
      },
      metadata: {
        createdBy,

        scope: {
          type: scopes.value[0],
          value: currentRelease.value.release_id,
        },
      },
    };

    openedSelection.value = createSelection(coordinates, selectionData);
    let initialScope = "";
    if (route.params.cdm) {
      initialScope = "sourceList";
    }
    if (route.params.release) {
      initialScope = "releaseList";
    }
    switchScope(initialScope);
  }
});

const emit = defineEmits(["close"]);

function submit() {
  const updatedSelection = {
    ...openedSelection.value,
    metadata: { ...openedSelection.value.metadata, updatedAt: Date.now() },
  };

  props.action(updatedSelection);
  emit("close");
}

function cancel() {
  store.commit(SET_SELECTED_RECTANGLE, null);
  emit("close");
}
</script>

<style scoped>
.newNote {
  display: flex;
  flex-direction: row;
  text-transform: uppercase;
}
</style>
