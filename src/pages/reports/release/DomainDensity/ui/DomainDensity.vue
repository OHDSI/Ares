<template>
  <div v-if="!store.getters.getErrors">
    <DomainDensity />
    <DomainRecordsPerPerson />
    <form-dialog
      @close="store.commit(SET_DIALOG, false)"
      :show="store.getters.getDialogData.show"
      :action="store.getters.getDialogData.action"
      :data="store.getters.getDialogData.data"
      :form-title="'Edit selection'"
    />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import DomainRecordsPerPerson from "./charts/DomainRecordsPerPerson/DomainRecordsPerPerson.vue";
import DomainDensity from "./charts/DomainDensity/DomainDensity.vue";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import FormDialog from "@/widgets/newNoteDialog/formDialog.vue";
const store = useStore();
</script>

<style scoped></style>
