<template>
  <div class="flex flex-col gap-10">
    <PageHeader title="Diversity Report" />
    <div class="flex flex-col gap-5">
      <EthnicityChart />
      <RaceChart />
    </div>
  </div>
</template>

<script setup lang="ts">
import EthnicityChart from "@/pages/reports/network/NetworkDiversityReport/charts/ethnicityChart/EthnicityChart.vue";
import RaceChart from "@/pages/reports/network/NetworkDiversityReport/charts/raceChart/RaceChart.vue";
import PageHeader from "@/entities/pageHeader/PageHeader.vue";
</script>

<style scoped></style>
