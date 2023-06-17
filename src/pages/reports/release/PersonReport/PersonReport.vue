<template>
  <div>
    <v-container
      v-if="!store.getters.getErrors && store.getters.dataInStore"
      fluid
    >
      <div class="text-uppercase text-h5 ma-4">Person Report</div>
      <v-responsive min-width="900">
        <v-row class="ma-4" justify="start">
          <!-- Total persons in top bar -->
          <v-col cols="2">
            <v-icon left color="primary">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="helpers.formatComma(store.getters.getData.numPersons)"
            ></v-badge>
            <p class="text-caption">Number of People</p>
          </v-col>
          <!-- Gender breakdown in top bar -->
          <v-col cols="4" align="center">
            <v-icon left color="primary">mdi-human-male-female</v-icon>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="
                'Male: ' +
                helpers.formatComma(store.getters.getData.genderMaleCount) +
                ' (' +
                helpers.formatPercent(store.getters.getData.genderMalePct) +
                ')'
              "
            ></v-badge>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="
                'Female: ' +
                helpers.formatComma(store.getters.getData.genderFemaleCount) +
                ' (' +
                helpers.formatPercent(store.getters.getData.genderFemalePct) +
                ')'
              "
            ></v-badge>
            <p class="text-caption">Proportion by Sex</p>
          </v-col>
        </v-row>
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
import { helpers } from "@/shared/lib/mixins";
import { useStore } from "vuex";
import PopulationByAgeSex from "@/pages/reports/release/PersonReport/charts/PopulationByAgeSex/PopulationByAgeSex.vue";
import PopulationByRace from "@/pages/reports/release/PersonReport/charts/PopulationByRace/PopulationByRace.vue";
import PopulationByYearBirth from "@/pages/reports/release/PersonReport/charts/PopulationByYearBirth/PopulationByYearBirth.vue";
import PopulationByEthnicity from "@/pages/reports/release/PersonReport/charts/PopulationByEthnicity/PopulationByEthnicity.vue";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import FormDialog from "@/widgets/selectionEditDialog/ui/selectionEditDialog.vue";

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
