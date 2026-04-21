<template>
  <div fluid>
    <div class="flex flex-col gap-10">
      <PageHeader title="Person Report" />
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
      <div class="flex flex-col gap-5">
        <PopulationByAgeSex />
        <PopulationByRace />
        <PopulationByYearBirth />
        <PopulationByEthnicity />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import PopulationByAgeSex from "@/pages/reports/release/PersonReport/charts/PopulationByAgeSex";
import PopulationByRace from "@/pages/reports/release/PersonReport/charts/PopulationByRace";
import PopulationByYearBirth from "@/pages/reports/release/PersonReport/charts/PopulationByYearBirth";
import PopulationByEthnicity from "@/pages/reports/release/PersonReport/charts/PopulationByEthnicity";
import InfoPanel from "@/widgets/infoPanel";
import PageHeader from "@/shared/ui/pageHeader";
import { onMounted } from "vue";

const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 90%;
}

.query-link {
  color: white;
}
</style>
