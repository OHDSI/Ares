<template>
  <v-container fluid min-width="900">
    <v-card elevation="10" class="ma-4" pa-2>
      <v-responsive>
        <v-expansion-panels v-model="panel" multiple>
          <v-expansion-panel elevation="10" class="ma-4">
            <v-expansion-panel-title class="text-lg-h6"
              >Domain Requirements</v-expansion-panel-title
            >
            <v-expansion-panel-text>
              <DomainRequirements
                :data="loadedData.sources"
                @domainsDataChanged="changeDomainData"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel elevation="10" class="ma-4">
            <v-expansion-panel-title class="text-lg-h6"
              >Desired Domains</v-expansion-panel-title
            >
            <v-expansion-panel-text>
              <DesiredDomains
                :data="loadedData.sources"
                @desiredDomainsDataChanged="changeDesiredDomainsData"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel elevation="10" class="ma-4">
            <v-expansion-panel-title class="text-lg-h6"
              >Range requirements</v-expansion-panel-title
            >
            <v-expansion-panel-text>
              <Range
                :observation-period="loadedData.observationPeriod"
                :person="loadedData.person"
                @rangeDataChanged="changeRangeData"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel elevation="10" class="ma-4">
            <v-expansion-panel-title class="text-lg-h6"
              >Visit types requirements</v-expansion-panel-title
            >
            <v-expansion-panel-text>
              <VisitTypes
                :data="loadedData.domainSummary"
                @visitTypesChanged="changeVisitTypesData"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel elevation="10" class="ma-4">
            <v-expansion-panel-title class="text-lg-h6"
              >Concepts requirements</v-expansion-panel-title
            >
            <v-expansion-panel-text>
              <RequiredConcepts
                @overlappingDataChanged="changeRequiredConceptsData"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel elevation="10" class="ma-4">
            <v-expansion-panel-title class="text-lg-h6"
              >Data Source Feasibility Overview</v-expansion-panel-title
            >
            <v-expansion-panel-text>
              <FinalEstimation :data="finalEstimation" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-responsive>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import DomainRequirements from "@/pages/reports/network/NetworkDataFeasibilityReport/DomainRequirements.vue";
import Range from "@/pages/reports/network/NetworkDataFeasibilityReport/Range.vue";
import VisitTypes from "@/pages/reports/network/NetworkDataFeasibilityReport/VisitTypes.vue";
import RequiredConcepts from "@/pages/reports/network/NetworkDataFeasibilityReport/RequiredConcepts.vue";
import FinalEstimation from "@/pages/reports/network/NetworkDataFeasibilityReport/FinalEstimation.vue";
import DesiredDomains from "@/pages/reports/network/NetworkDataFeasibilityReport/DesiredDomains.vue";

import { computed, watch, ref } from "vue";

const store = useStore();

const sources = ref([]);
const person = ref([]);
const loadedData = ref({});
const chosenDomains = ref([]);
const rangeData = ref([]);
const desiredDomains = ref([]);
const panel = ref([0]);
const requiredConcepts = ref([]);
const visitTypes = ref([]);

const finalEstimation = computed(function () {
  return {
    domainData: chosenDomains.value,
    rangeData: rangeData.value,
    requiredConcepts: requiredConcepts.value,
    visitTypes: visitTypes.value,
    sourcePopulation: loadedData.value.person,
    desiredDomains: desiredDomains.value,
  };
});

const getData = computed(() => {
  return store.getters.getData;
});

watch(getData, () => {
  if (Object.keys(getData.value).length) {
    if (!Object.keys(loadedData.value).length) {
      loadedData.value = {
        sources: getData.value.sources,
        person: getData.value.person,
        domainSummary: getData.value.domainSummary,
        observationPeriod: getData.value.observationPeriod,
      };
    }
  }
});

function changeDomainData(value) {
  chosenDomains.value = value;
}
function changeRangeData(value) {
  rangeData.value = value;
}
function changeRequiredConceptsData(value) {
  requiredConcepts.value = value;
}
function changeVisitTypesData(value) {
  visitTypes.value = value;
}
function changeDesiredDomainsData(value) {
  desiredDomains.value = value;
}
</script>

<script lang="ts">
export default {
  name: "NetworkDataFeasibility",
};
</script>

<style scoped></style>
