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
import { computed } from "vue";
import { useStore } from "vuex";
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

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);

function chartSpec({ data }: { data: any[] }) {
  return scatterChartSpec({
    data,
    selectedDatabaseName: props.selectedDatabaseName,
    darkMode: darkMode.value,
  });
}
</script>

<style scoped>
@import "../../shared/styles.css";
</style>
