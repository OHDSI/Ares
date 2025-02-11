<template>
  <div class="flex flex-col gap-5">
    <DomainRequirements
      :data="loadedData.sources"
      @domainsDataChanged="changeDomainData"
    />
    <DesiredDomains
      :data="loadedData.sources"
      @desiredDomainsDataChanged="changeDesiredDomainsData"
    />
    <Range
      :observation-period="loadedData.observationPeriod"
      :person="loadedData.person"
      @rangeDataChanged="changeRangeData"
    />
    <VisitTypes
      :data="loadedData.domainSummary"
      @visitTypesChanged="changeVisitTypesData"
    />

    <RequiredConcepts @overlappingDataChanged="changeRequiredConceptsData" />
    <FinalEstimation :data="finalEstimation" />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import DomainRequirements from "@/pages/reports/network/NetworkDataFeasibilityReport/components/DomainRequirements.vue";
import Range from "@/pages/reports/network/NetworkDataFeasibilityReport/components/Range.vue";
import VisitTypes from "@/pages/reports/network/NetworkDataFeasibilityReport/components/VisitTypes.vue";
import RequiredConcepts from "@/pages/reports/network/NetworkDataFeasibilityReport/components/RequiredConcepts.vue";
import FinalEstimation from "@/pages/reports/network/NetworkDataFeasibilityReport/components/FinalEstimation.vue";
import DesiredDomains from "@/pages/reports/network/NetworkDataFeasibilityReport/components/DesiredDomains.vue";

import { computed, ref, onBeforeMount } from "vue";

const store = useStore();
const loadedData = ref({});
const chosenDomains = ref([]);
const rangeData = ref([]);
const desiredDomains = ref([]);
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

function loadData() {
  loadedData.value = {
    sources: getData.value.sources,
    person: getData.value.person,
    domainSummary: getData.value.domainSummary,
    observationPeriod: getData.value.observationPeriod,
  };
}

onBeforeMount(loadData);
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
