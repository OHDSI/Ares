<template>
  <div class="flex flex-col gap-10" v-if="!store.getters.getErrors">
    <DomainDensity />
    <DomainRecordsPerPerson />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import DomainRecordsPerPerson from "@/pages/reports/release/DomainDensity/charts/DomainRecordsPerPerson/DomainRecordsPerPerson.vue";
import DomainDensity from "@/pages/reports/release/DomainDensity/charts/DomainDensity/DomainDensity.vue";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import FormDialog from "@/widgets/selectionEditDialog/ui/selectionEditDialog.vue";
const store = useStore();
</script>

<style scoped></style>
