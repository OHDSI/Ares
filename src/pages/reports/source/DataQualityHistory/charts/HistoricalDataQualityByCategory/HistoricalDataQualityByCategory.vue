<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-dataqualityresultsbycategory"
      title="Historical Data Quality by Category"
      :data="store.getters.getData[QUALITY_INDEX].dataQualityRecordsStratified"
      :config="specDataQualityResultsByCategory"
    />
  </v-card>
</template>

<script setup lang="ts">
import { QUALITY_INDEX } from "@/shared/config/files";
import { Chart } from "@/widgets/chart";
import { specDataQualityResultsByCategory } from "./specDataQualityResultsByCategory";
import { useStore } from "vuex";
import { computed } from "vue";
const store = useStore();
</script>

<style scoped></style>
