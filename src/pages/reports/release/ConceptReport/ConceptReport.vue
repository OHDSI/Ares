<template>
  <div>
    <v-container v-if="!store.getErrors && store.getters.dataInStore" fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-6 d-flex justify-md-space-between">
          <h2 class="text-uppercase">
            {{ store.getters.getData.conceptName }}
          </h2>
          <ReturnButton />
        </v-layout>
        <v-row v-if="store.getters.dataInStore" justify="start"
          ><v-col cols="2" align="center">
            <v-icon left color="primary">mdi-identifier</v-icon>
            <v-badge
              tile
              inline
              color="primary"
              :content="store.getters.getData.conceptId"
            ></v-badge>
            <p class="text-caption">Concept Identifier</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="primary">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="store.getters.getData.numPersons"
            ></v-badge>
            <p class="text-caption">Number of People</p></v-col
          ><v-col cols="2" align="center">
            <v-icon small left color="primary">mdi-percent</v-icon>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="
                helpers.formatPercent(store.getters.getData.percentPersons)
              "
            ></v-badge>
            <p class="text-caption">% of People</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="primary">mdi-table-row</v-icon>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="store.getters.getData.recordsPerPerson"
            ></v-badge>
            <p class="text-caption">Records per Person</p></v-col
          >
          <v-col
            v-if="route.params.domain === 'measurement'"
            cols="2"
            align="center"
          >
            <v-icon left color="primary">mdi-database-check-outline</v-icon>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="getPercentWithValues"
            ></v-badge>
            <p class="text-caption">% with Values</p></v-col
          >
          <v-col
            v-if="store.getters.getData.conceptData.COUNT_FAILED"
            cols="2"
            align="center"
          >
            <v-icon left color="error" @click="navigateToDataQuality()"
              >mdi-database-alert</v-icon
            >
            <v-badge
              tile
              inline
              dark
              color="error"
              :content="store.getters.getData.countFailed"
            ></v-badge>
            <p class="text-caption">Data Quality Issues</p></v-col
          ><v-col
            v-if="store.getters.getData.isNotStationary"
            cols="2"
            align="center"
          >
            <v-icon left color="error">mdi-clock-alert</v-icon>
            <p class="text-caption">Non-Stationary Time Series</p></v-col
          ></v-row
        >
        <MeasurementTable />
        <MeasurementValueDistribution />
        <AgeAtFirstDiagnosis />
        <AgeAtFirstExposure />
        <LengthOfEra />
        <ConditionsByType />
        <DrugsByType />
        <RecordsByUnit />
        <MeasurementsByType />
        <AgeAtFirstOccurrence />
        <RecordCountProportionByMonth />
        <DaysSupply />
        <QuantityDistribution />
        <VisitDurationByType />
        <RecordCountProportionByAgeSexYear />
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
import ReturnButton from "@/features/returnToPreviousPage";
import { useRoute } from "vue-router";
import { helpers } from "@/shared/lib/mixins";
import { computed } from "vue";
import { useStore } from "vuex";
import MeasurementTable from "@/pages/reports/release/ConceptReport/charts/MeasurementTable/MeasurementTable.vue";
import MeasurementValueDistribution from "@/pages/reports/release/ConceptReport/charts/MeasurementValueDistribution/MeasurementValueDistribution.vue";
import AgeAtFirstDiagnosis from "@/pages/reports/release/ConceptReport/charts/AgeAtFirstDiagnosis/AgeAtFirstDiagnosis.vue";
import AgeAtFirstExposure from "@/pages/reports/release/ConceptReport/charts/AgeAtFirstExposure/AgeAtFirstExposure.vue";
import LengthOfEra from "@/pages/reports/release/ConceptReport/charts/LengthOfEra/LengthOfEra.vue";
import ConditionsByType from "@/pages/reports/release/ConceptReport/charts/ConditionsByType/ConditionsByType.vue";
import DrugsByType from "@/pages/reports/release/ConceptReport/charts/DrugsByType/DrugsByType.vue";
import RecordsByUnit from "@/pages/reports/release/ConceptReport/charts/RecordsByUnit/RecordsByUnit.vue";
import MeasurementsByType from "@/pages/reports/release/ConceptReport/charts/MeasurementsByType/MeasurementsByType.vue";
import AgeAtFirstOccurrence from "@/pages/reports/release/ConceptReport/charts/AgeAtFirstOccurrence/AgeAtFirstOccurrence.vue";
import RecordCountProportionByMonth from "@/pages/reports/release/ConceptReport/charts/RecordsCountProportionByMonth/RecordCountProportionByMonth.vue";
import DaysSupply from "@/pages/reports/release/ConceptReport/charts/DaysSupply/DaysSupply.vue";
import QuantityDistribution from "@/pages/reports/release/ConceptReport/charts/QuantityDistribution/QuantityDistribution.vue";
import VisitDurationByType from "@/pages/reports/release/ConceptReport/charts/VisitDurationByType/VisitDurationByType.vue";
import RecordCountProportionByAgeSexYear from "@/pages/reports/release/ConceptReport/charts/RecordCountProportionByAgeSexYear/RecordCountProportionByAgeSexYear.vue";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import FormDialog from "@/widgets/newNoteDialog/formDialog.vue";

const route = useRoute();
const store = useStore();

const getPercentWithValues = computed((): string => {
  const missingData = store.getters.getData.domainSummary.filter(
    (data) => data.CONCEPT_ID === route.params.concept
  )[0].PERCENT_MISSING_VALUES;
  return missingData ? `${((1 - missingData) * 100).toFixed(2)}%` : "No data";
});

const navigateToDataQuality = function () {
  return {
    name: "dataQuality",
    query: { tab: "results", search: route.params.concept },
  };
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
