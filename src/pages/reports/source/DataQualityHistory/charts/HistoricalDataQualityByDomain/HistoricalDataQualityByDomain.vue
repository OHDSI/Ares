<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-dataqualityresultsbydomain"
      title="Historical Data Quality by Domain"
      :config="specDataQualityResultsByDomain"
      :data="store.getters.getData[QUALITY_INDEX].dataQualityRecordsStratified"
    />
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specDataQualityResultsByDomain } from "./specDataQualityResultsByDomain";
import { QUALITY_INDEX } from "@/shared/config/files";
import { useStore } from "vuex";
import { computed } from "vue";

const store = useStore();
</script>

<style scoped></style>
