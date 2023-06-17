<template>
  <div
    v-if="store.getters.explorerLoaded"
    id="network-data-quality-overview"
    class="pa-4"
  >
    <v-row>
      <v-col>
        <OverviewDisplay />
      </v-col>
    </v-row>
    <v-row>
      <v-col class="overflow-auto">
        <PopulationHistory />
      </v-col>
      <v-col class="overflow-auto">
        <DataQualityIssuesHistory />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ReleaseListing />
      </v-col>
    </v-row>
    <form-dialog
      @close="store.commit(SET_DIALOG, false)"
      v-if="store.getters.getDialogData.show"
      :show="store.getters.getDialogData.show"
      :action="store.getters.getDialogData.action"
      :data="store.getters.getDialogData.data"
      :form-title="'Edit selection'"
    />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import OverviewDisplay from "@/pages/reports/source/SourceOverview/charts/overviewDisplay/OverviewDisplay.vue";
import PopulationHistory from "@/pages/reports/source/SourceOverview/charts/populationHistory/PopulationHistory.vue";
import DataQualityIssuesHistory from "@/pages/reports/source/SourceOverview/charts/dataQualityIssuesHistory/DataQualityIssuesHistory.vue";
import ReleaseListing from "@/pages/reports/source/SourceOverview/charts/releaseListing/ReleaseListing.vue";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import FormDialog from "@/widgets/selectionEditDialog/ui/selectionEditDialog.vue";

const store = useStore();
</script>

<style scoped></style>
