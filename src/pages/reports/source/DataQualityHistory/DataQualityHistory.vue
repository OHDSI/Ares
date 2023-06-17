<template>
  <div>
    <HistoricalDataQuality />
    <HistoricalDataQualityByCategory />
    <HistoricalDataQualityByDomain />
  </div>
  <form-dialog
    @close="store.commit(SET_DIALOG, false)"
    v-if="store.getters.getDialogData.show"
    :show="store.getters.getDialogData.show"
    :action="store.getters.getDialogData.action"
    :data="store.getters.getDialogData.data"
    :form-title="'Edit selection'"
  />
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import HistoricalDataQuality from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQuality/HistoricalDataQuality.vue";
import HistoricalDataQualityByCategory from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByCategory/HistoricalDataQualityByCategory.vue";
import HistoricalDataQualityByDomain from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByDomain/HistoricalDataQualityByDomain.vue";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import FormDialog from "@/widgets/selectionEditDialog/ui/selectionEditDialog.vue";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
