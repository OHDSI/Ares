<template>
  <div class="note-edit-card">
    <div class="note-title-row">
      <InputText
        class="note-title-input"
        placeholder="Title"
        v-model="currentCard.title"
        @update:modelValue="editCard()"
        unstyled
      />
    </div>
    <Codemirror
      class="note-editor"
      :style="{ height: '190px' }"
      v-model="currentCard.description"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      @update:modelValue="editCard()"
    />
    <div class="note-edit-footer">
      <button class="delete-btn" @click="showTemplate()">Delete</button>
    </div>
  </div>
  <ConfirmDialog :group="'templating' + props.note.id">
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div
        class="bg-surface-0 dark:bg-surface-800 rounded-lg shadow-xl border border-surface-200 dark:border-surface-700 w-72 overflow-hidden"
      >
        <div
          class="px-5 py-4 border-b border-surface-200 dark:border-surface-700"
        >
          <span
            class="font-semibold text-sm"
            style="color: var(--color-text)"
            >{{ message.header }}</span
          >
        </div>
        <div class="px-5 py-4">
          <p class="text-sm m-0" style="color: var(--color-text-body)">
            {{ message.message }}
          </p>
        </div>
        <div
          class="px-5 py-3 border-t border-surface-200 dark:border-surface-700 flex justify-end gap-2"
        >
          <button
            class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded border border-surface-300 dark:border-surface-600 bg-transparent hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors duration-150 cursor-pointer"
            style="color: var(--color-text-muted)"
            @click="rejectCallback"
          >
            Cancel
          </button>
          <button
            class="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 hover:border-red-400 dark:hover:border-red-600 transition-colors duration-150 cursor-pointer"
            @click="acceptCallback"
          >
            Delete
          </button>
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from "vue";
import { Codemirror } from "vue-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "codemirror";
import InputText from "primevue/inputtext";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";
import { useStore } from "vuex";

const emit = defineEmits(["editCard", "deleteCard"]);

interface Note {
  title: string;
  description: string;
  id: number;
  updatedAt: number;
  createdAt: number;
  report?: string;
  selection?: string;
  createdBy: string;
}

interface Props {
  note: Note;
  edit?: boolean;
}

const props = defineProps<Props>();

const store = useStore();
const confirm = useConfirm();

const lightTheme = EditorView.theme({
  "&": { background: "var(--color-bg-surface)", color: "var(--color-text)" },
  ".cm-gutters": {
    background: "var(--color-bg-raised)",
    color: "var(--color-text-subtle)",
    border: "none",
  },
  ".cm-activeLine": { background: "var(--color-bg-subtle)" },
  ".cm-cursor": { borderLeftColor: "var(--color-text)" },
  ".cm-selectionBackground": { background: "rgba(33,150,243,0.2)" },
});

const extensions = computed(() =>
  store.getters.getSettings.darkMode
    ? [markdown(), oneDark]
    : [markdown(), lightTheme],
);

const currentCard = ref(null);

onBeforeMount(() => {
  currentCard.value = { ...props.note };
});

function showTemplate() {
  confirm.require({
    group: `templating${props.note.id}`,
    header: "Confirmation",
    message: "Are you sure you want to delete this note?",
    icon: "pi pi-exclamation-circle",
    acceptIcon: "pi pi-check",
    rejectIcon: "pi pi-times",
    rejectClass: "p-button-sm",
    acceptClass: "p-button-outlined p-button-sm",
    accept: () => deleteCard(),
    reject: () => {},
  });
}

function deleteCard() {
  emit("deleteCard", props.note.id);
}

function editCard() {
  emit("editCard", { ...currentCard.value, lastUpdated: Date.now() });
}
</script>

<style scoped>
.note-edit-card {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border: 1.5px solid var(--color-border-subtle);
  border-radius: 8px;
  background: var(--color-bg-surface);
  overflow: hidden;
}

.note-title-row {
  border-bottom: 1px solid var(--color-border-subtle);
}

.note-title-input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
  background: transparent;
  border: none;
  outline: none;
}

.note-title-input::placeholder {
  color: var(--color-text-subtle);
}

.note-editor {
  border-bottom: 1px solid var(--color-border-subtle);
}

:deep(.note-editor .cm-editor) {
  border: none;
  border-radius: 0;
}

:deep(.note-editor .cm-scroller) {
  font-size: 0.8125rem;
}

.note-edit-footer {
  padding: 0.375rem 0.5rem;
  display: flex;
  justify-content: flex-end;
}

.delete-btn {
  font-size: 0.75rem;
  font-weight: 500;
  color: #dc2626;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.15s ease;
}

.delete-btn:hover {
  background: rgba(220, 38, 38, 0.08);
}
</style>
