<template>
  <div class="flex flex-col gap-5">
    <HistoricalDataQuality />
    <HistoricalDataQualityByCategory />
    <HistoricalDataQualityByDomain />
  </div>
</template>

<script setup lang="ts">
import HistoricalDataQuality from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQuality/HistoricalDataQuality.vue";
import HistoricalDataQualityByCategory from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByCategory/HistoricalDataQualityByCategory.vue";
import HistoricalDataQualityByDomain from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByDomain/HistoricalDataQualityByDomain.vue";
</script>

<style scoped></style>
