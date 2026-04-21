<template>
  <div class="flex flex-col gap-5">
    <HistoricalDataQuality />
    <HistoricalDataQualityByCategory />
    <HistoricalDataQualityByDomain />
    <DataQualityDelta />
  </div>
</template>

<script setup lang="ts">
import HistoricalDataQuality from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQuality";
import HistoricalDataQualityByCategory from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByCategory";
import HistoricalDataQualityByDomain from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByDomain";
import DataQualityDelta from "@/pages/reports/source/DataQualityHistory/charts/DataQualityDelta";
</script>

<style scoped></style>
