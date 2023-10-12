<template>
  <div>
    <v-container
      v-if="!store.getters.getErrors && store.getters.dataInStore"
      fluid
    >
      <div class="text-uppercase text-h5 ma-4">Person Report</div>
      <v-responsive min-width="900">
        <InfoPanel
          :population="store.getters.getData.numPersons"
          :proportion-sex="{
            male: {
              count: store.getters.getData.genderMaleCount,
              pct: store.getters.getData.genderMalePct,
            },
            female: {
              count: store.getters.getData.genderFemaleCount,
              pct: store.getters.getData.genderFemalePct,
            },
          }"
        />
        <PopulationByAgeSex />
        <PopulationByRace />
        <PopulationByYearBirth />
        <PopulationByEthnicity />
      </v-responsive>
      <form-dialog
        @close="store.commit(SET_DIALOG, false)"
        v-if="store.getters.getDialogData.show"
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
import PopulationByAgeSex from "@/pages/reports/release/PersonReport/charts/PopulationByAgeSex/PopulationByAgeSex.vue";
import PopulationByRace from "@/pages/reports/release/PersonReport/charts/PopulationByRace/PopulationByRace.vue";
import PopulationByYearBirth from "@/pages/reports/release/PersonReport/charts/PopulationByYearBirth/PopulationByYearBirth.vue";
import PopulationByEthnicity from "@/pages/reports/release/PersonReport/charts/PopulationByEthnicity/PopulationByEthnicity.vue";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import FormDialog from "@/widgets/selectionEditDialog/ui/selectionEditDialog.vue";
import InfoPanel from "@/widgets/infoPanel";

const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 90%;
}
.v-tooltip__content {
  pointer-events: initial;
}
.query-link {
  color: white;
}
</style>
