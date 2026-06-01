<template>
  <Dialog
    :pt="{
      root: { class: 'w-[860px] max-h-[85vh]' },
    }"
    :header="formTitle"
    unstyled
    modal
    v-model:visible="renderDialog"
  >
    <div class="dialog-body">
      <div class="dialog-col">
        <div class="col-section">
          <label class="section-label">Selection</label>
          <div class="field-stack">
            <div>
              <label class="field-label"
                >Title <span class="required-mark">*</span></label
              >
              <InputText
                :class="['w-full', { 'input-error': titleError }]"
                placeholder="Enter a title"
                size="small"
                v-model="openedSelection.body.title"
                @input="titleError = false"
              />
              <span v-if="titleError" class="error-msg">Title is required</span>
            </div>
            <div>
              <label class="field-label">Description</label>
              <Textarea
                class="w-full"
                placeholder="Describe this selection…"
                auto-resize
                rows="7"
                v-model="openedSelection.body.description"
              />
            </div>
          </div>
        </div>

        <div class="col-section">
          <label class="section-label">Scope</label>
          <div class="field-stack">
            <div>
              <label class="field-label">Type</label>
              <Dropdown
                class="w-full"
                v-model="openedSelection.metadata.scope.type"
                :options="scopes"
                option-label="title"
                option-value="value"
                @update:modelValue="switchScope"
              />
            </div>
            <MultiSelect
              class="w-full"
              v-model="openedSelection.metadata.scope.value.release"
              :options="getReleases"
              option-label="release_name"
              option-value="release_id"
              v-if="openedSelection.metadata.scope.type === 'releaseList'"
            />
            <MultiSelect
              class="w-full"
              v-model="openedSelection.metadata.scope.value.source"
              :options="getSources"
              option-label="cdm_source_name"
              option-value="cdm_source_key"
              v-if="openedSelection.metadata.scope.type === 'sourceList'"
            />
          </div>
        </div>
      </div>

      <div class="col-divider" />

      <div class="dialog-col notes-col">
        <div class="col-section notes-section">
          <div class="notes-header">
            <label class="section-label">Notes</label>
            <Button
              unstyled
              :pt="{
                root: {
                  class:
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-surface-300 dark:border-surface-600 text-surface-600 dark:text-surface-300 bg-transparent hover:bg-surface-100 dark:hover:bg-surface-700 transition duration-150 cursor-pointer',
                },
              }"
              @click="addNote"
            >
              <svg-icon type="mdi" :path="mdiPlusThick" :size="14" />
              <span>Add note</span>
            </Button>
          </div>
          <div class="notes-list">
            <metadata-card
              @delete-card="removeNote"
              @edit-card="editNote"
              edit
              v-for="note in openedSelection.body.notes"
              :note="note"
              :key="note.id"
            />
            <div v-if="!openedSelection.body.notes.length" class="notes-empty">
              No notes yet. Add one to annotate this selection.
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        unstyled
        :pt="{
          root: {
            class:
              'inline-flex items-center px-4 py-2 text-sm font-medium rounded border border-surface-300 dark:border-surface-600 text-surface-600 dark:text-surface-300 bg-transparent hover:bg-surface-100 dark:hover:bg-surface-700 transition duration-150 cursor-pointer',
          },
        }"
        @click="cancel"
      >
        Cancel
      </Button>
      <Button
        unstyled
        :pt="{
          root: {
            class:
              'inline-flex items-center px-4 py-2 text-sm font-semibold rounded border border-primary-400 dark:border-primary-400 text-primary-600 dark:text-primary-300 bg-primary-50/50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 hover:border-primary-500 dark:hover:border-primary-300 hover:text-primary-700 dark:hover:text-primary-200 transition duration-150 cursor-pointer',
          },
        }"
        @click="submit"
      >
        Save
      </Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from "vue";
import MetadataCard from "@/widgets/chartMetadataCard";
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
import SvgIcon from "@/shared/ui/svgIcon";
import { useRoute } from "vue-router";

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
  ].filter((val) => val.show),
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
  return (
    store.getters.getSelectedRelease ||
    store.getters.getSelectedSource.releases[0]
  );
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
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    description: "",
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
    (selection) => selection.id === event.id,
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
    openedSelection.value = JSON.parse(JSON.stringify(storeSelection.value));
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

const titleError = ref(false);

const emit = defineEmits(["close"]);

function submit() {
  if (!openedSelection.value.body.title?.trim()) {
    titleError.value = true;
    return;
  }

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
.dialog-body {
  display: flex;
  flex-direction: row;
  height: min(560px, calc(85vh - 7rem));
  overflow: hidden;
  background: var(--color-bg-surface);
}

.dialog-col {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}

.notes-col {
  flex: 1.1;
  overflow: hidden;
}

.col-divider {
  width: 1px;
  background: var(--color-border-subtle);
  flex-shrink: 0;
  align-self: stretch;
}

.col-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-label {
  display: block;
  font-weight: 700;
  font-size: 0.6875rem;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.field-label {
  display: block;
  font-weight: 600;
  font-size: 0.8125rem;
  margin-bottom: 0.3rem;
  color: var(--color-text-label);
}

.field-stack {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.required-mark {
  color: #dc2626;
  margin-left: 1px;
}

:deep(.input-error) {
  border-color: #dc2626 !important;
  outline-color: #dc2626;
}

.error-msg {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #dc2626;
}

.notes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notes-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-top: 6px;
  padding-right: 2px;
}

.notes-empty {
  font-size: 0.8125rem;
  color: var(--color-text-subtle);
  text-align: center;
  padding: 2rem 1rem;
  border: 1px dashed var(--color-border-subtle);
  border-radius: 6px;
}
</style>
