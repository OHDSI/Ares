<template>
  <div v-if="!store.getters.getErrors">
    <v-container fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-6 text-uppercase text-h6"
          >NETWORK POPULATION OVERVIEW</v-layout
        >
        <AgeAtFirstObservation />
        <CumulativeObservation />
      </v-responsive>
      <form-dialog
        @close="store.commit(SET_DIALOG, false)"
        :show="store.getters.getDialogData.show"
        :action="store.getters.getDialogData.action"
        :data="store.getters.getDialogData.data"
        :form-title="'Edit selection'"
      />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";

import AgeAtFirstObservation from "@/pages/reports/network/NetworkPopulationReport/charts/ageAtFirstObservation/AgeAtFirstObservation.vue";
import CumulativeObservation from "@/pages/reports/network/NetworkPopulationReport/charts/cumulativeObservation/CumulativeObservation.vue";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import FormDialog from "@/widgets/selectionEditDialog/ui/selectionEditDialog.vue";

const store = useStore();
</script>

<style scoped></style>
