<template>
  <div>
    <v-container v-if="!store.getters.getErrors" fluid>
      <v-responsive min-width="900">
        <div class="text-uppercase text-h6">Observation Period Report</div>
        <CumulativeObservation />
        <ObservationPeriodsPerPerson />
        <ObservationOverTime />
        <YearsOfObservationByAge />
        <YearsOfObservationBySex />
        <AgeAtFirstObservation />
        <AgeAtFirstObservationBySex />
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
import CumulativeObservation from "@/pages/reports/release/ObservationPeriodReport/ui/charts/CumulativeObservation/CumulativeObservation.vue";
import ObservationPeriodsPerPerson from "@/pages/reports/release/ObservationPeriodReport/ui/charts/ObservationPeriodPerPerson/ObservationPeriodsPerPerson.vue";
import ObservationOverTime from "@/pages/reports/release/ObservationPeriodReport/ui/charts/ObservationOverTime/ObservationOverTime.vue";
import YearsOfObservationByAge from "@/pages/reports/release/ObservationPeriodReport/ui/charts/YearsOfObservationByAge/YearsOfObservationByAge.vue";
import YearsOfObservationBySex from "@/pages/reports/release/ObservationPeriodReport/ui/charts/YearsOfObservationBySex/YearsOfObservationBySex.vue";
import AgeAtFirstObservation from "@/pages/reports/release/ObservationPeriodReport/ui/charts/AgeAtFirstObservation/AgeAtFirstObservation.vue";
import AgeAtFirstObservationBySex from "@/pages/reports/release/ObservationPeriodReport/ui/charts/AgeAtFirstObservationBySex/AgeAtFirstObservationBySex.vue";
import { useStore } from "vuex";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import FormDialog from "@/widgets/newNoteDialog/formDialog.vue";

const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
