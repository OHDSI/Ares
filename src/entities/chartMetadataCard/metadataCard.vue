<template>
  <div
    v-if="!props.edit"
    class="flex flex-col gap-5 shadow-xl px-3 py-5 bg-white dark:bg-surface-800 m-4"
  >
    <div class="flex flex-g gap-10 justify-between">
      <h3 class="font-bold text-xl">{{ props.note.title }}</h3>
      <span>
        <button
          v-tooltip.top="{
            value: `Created By: ${user}\n Last updated: ${dateTimeUpdated}`,
            pt: {
              root: '',
              arrow: {
                style: {
                  borderRightColor: 'var(--primary-color)',
                },
              },
              text: 'border rounded bg-surface-800 dark:bg-surface-50 text-white dark:text-black font-light p-2',
            },
          }"
          text
          rounded
        >
          <svg-icon type="mdi" :path="mdiInformationOutline"></svg-icon>
        </button>
      </span>
    </div>
    <p>{{ props.note.description }}</p>
  </div>
  <div v-else class="card shadow-md rounded bg-white dark:bg-surface-800">
    <InputText
      size="small"
      placeholder="Title"
      v-model="currentCard.title"
      @update:modelValue="editCard()"
    />
    <div class="py-1">
      <Codemirror
        :style="{ height: '190px' }"
        v-model="currentCard.description"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="extensions"
        @update:modelValue="editCard()"
      ></Codemirror>
    </div>
    <div class="relative bottom-0">
      <Button @click="showTemplate()" severity="danger" plain size="block" text
        >DELETE</Button
      >
    </div>
  </div>
  <ConfirmDialog :group="'templating' + props.note.id">
    <template #message="slotProps">
      <div
        class="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border"
      >
        <i
          :class="slotProps.message.icon"
          class="text-6xl text-primary-500"
        ></i>
        <p>{{ slotProps.message.message }}</p>
      </div>
    </template>
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { defineProps, ref, defineEmits, onBeforeMount, computed } from "vue";
import { Codemirror } from "vue-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { mdiInformationOutline } from "@mdi/js";
import SvgIcon from "@jamescoyle/vue-icon";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import ConfirmDialog from "primevue/confirmdialog";

const emit = defineEmits(["editCard", "deleteCard"]);

import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();
const showTemplate = () => {
  confirm.require({
    group: `${"templating" + props.note.id}`,
    header: "Confirmation",
    message: "Are you sure you want to delete this note?",
    icon: "pi pi-exclamation-circle",
    acceptIcon: "pi pi-check",
    rejectIcon: "pi pi-times",
    rejectClass: "p-button-sm",
    acceptClass: "p-button-outlined p-button-sm",
    accept: () => {
      deleteCard();
      return;
    },
    reject: () => {
      return;
    },
  });
};
const extensions = [markdown(), oneDark];

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

const dateTimeCreated = computed(() => {
  const isoDate = new Date(props.note.createdAt);
  return isoDate.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
});

const dateTimeUpdated = computed(() => {
  if (props.note.updatedAt) {
    const isoDate = new Date(props.note.updatedAt);
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

const props = defineProps<Props>();
</script>

<style lang="scss">
.card {
  display: flex;
  align-content: space-between;
  flex-direction: column;
  max-width: 400px;
  max-height: 300px;

  transform: translateY(-5px);
}

.cm-editor {
  background-color: rgba(var(--v-theme-surface));
}
.cm-gutters {
  background-color: rgba(var(--v-theme-accent)) !important;
}
</style>
