<template>
  <div class="plot-filters">
    <div>
      <label class="field-label">Databases</label>
      <MultiSelect
        v-model="plotDatabases"
        :options="uniqueDatabases"
        placeholder="All databases"
        filter
        display="chip"
        class="w-full"
      />
    </div>
    <div>
      <label class="field-label">Timespan</label>
      <MultiSelect
        v-model="plotTimeScales"
        :options="uniqueTimeScales"
        placeholder="All"
        class="w-full"
      />
    </div>
    <div>
      <label class="field-label">Outcome type</label>
      <MultiSelect
        v-model="plotOutcomeTypes"
        :options="uniqueOutcomeTypes"
        placeholder="All"
        class="w-full"
      />
    </div>
    <div>
      <label class="field-label">Timing</label>
      <MultiSelect
        v-model="plotTargetOutcomeTypes"
        :options="uniqueTargetOutcomeTypes"
        placeholder="All"
        class="w-full"
      />
    </div>
  </div>
  <Chart
    :data="filteredPlotData"
    :chartSpec="tteChartSpec"
    :height="tteChartHeightComputed"
    id="time-to-event"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Chart from "@/widgets/echarts/echarts";
import { tteChartSpec, tteChartHeight } from "../chartSpec";
import MultiSelect from "primevue/multiselect";

const props = defineProps<{
  data: any[];
  darkMode: boolean;
}>();

const plotDatabases = ref<string[]>([]);
const plotTimeScales = ref<string[]>([]);
const plotOutcomeTypes = ref<string[]>([]);
const plotTargetOutcomeTypes = ref<string[]>([]);

const uniqueDatabases = computed(() => [
  ...new Set(props.data.map((r) => r.databaseName)),
]);
const uniqueTimeScales = computed(() => [
  ...new Set(props.data.map((r) => r.timeScale)),
]);
const uniqueOutcomeTypes = computed(() => [
  ...new Set(props.data.map((r) => r.outcomeType)),
]);
const uniqueTargetOutcomeTypes = computed(() => [
  ...new Set(props.data.map((r) => r.targetOutcomeType)),
]);

const filteredPlotData = computed(() => {
  return props.data.filter(
    (r) =>
      (plotDatabases.value.length === 0 ||
        plotDatabases.value.includes(r.databaseName)) &&
      (plotTimeScales.value.length === 0 ||
        plotTimeScales.value.includes(r.timeScale)) &&
      (plotOutcomeTypes.value.length === 0 ||
        plotOutcomeTypes.value.includes(r.outcomeType)) &&
      (plotTargetOutcomeTypes.value.length === 0 ||
        plotTargetOutcomeTypes.value.includes(r.targetOutcomeType)) &&
      r.numEvents > 0
  );
});

const tteChartHeightComputed = computed(() =>
  tteChartHeight(filteredPlotData.value)
);

watch(
  () => props.data,
  () => {
    plotDatabases.value = [...uniqueDatabases.value];
    plotTimeScales.value = [...uniqueTimeScales.value];
    plotOutcomeTypes.value = [...uniqueOutcomeTypes.value];
    plotTargetOutcomeTypes.value = [...uniqueTargetOutcomeTypes.value];
  },
  { immediate: false }
);
</script>

<style scoped>
@import "../../shared/styles.css";

.plot-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: start;
  margin-bottom: 0.75rem;
}

.plot-filters > div {
  min-width: 160px;
  flex: 1;
}
</style>
