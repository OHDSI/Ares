<template>
  <div>
    <div v-if="covRef.length === 2" class="scatter-container">
      <Chart
        :data="data"
        :chartSpec="chartSpec"
        id="cohort-comparison"
        height="500px"
      />
    </div>
    <p v-else class="table-note">Need exactly 2 cohorts with data to plot.</p>
  </div>
</template>

<script setup lang="ts">
import Chart from "@/widgets/echarts/echarts";
import { scatterChartSpec } from "../chartSpec";

interface CovRefItem {
  id: string;
  cohortId: number;
  minPriorObservation: number;
  n: number;
}

const props = defineProps<{
  data: any[];
  covRef: CovRefItem[];
  selectedDatabaseName: string;
}>();

function chartSpec({ data }: { data: any[] }) {
  return scatterChartSpec({
    data,
    selectedDatabaseName: props.selectedDatabaseName,
  });
}
</script>

<style scoped>
@import "../../shared/styles.css";
</style>
