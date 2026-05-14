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
import { ref, computed, watch, onMounted, nextTick } from "vue";
import Chart from "@/widgets/echarts/echarts";
import { tteChartSpec, tteChartHeight } from "../chartSpec";
import MultiSelect from "primevue/multiselect";
import { useCharacterizationUrl } from "@/shared/lib/composables/useCharacterizationUrl";

const props = defineProps<{
  data: any[];
  darkMode: boolean;
}>();

const { readUrl, patchUrl } = useCharacterizationUrl();

const plotDatabases = ref<string[]>([]);
const plotTimeScales = ref<string[]>([]);
const plotOutcomeTypes = ref<string[]>([]);
const plotTargetOutcomeTypes = ref<string[]>([]);
let _chartReady = false;
let _urlRestored = false;

function writeTteUrl() {
  if (!_chartReady) return;
  patchUrl({
    tteDbs: plotDatabases.value.length ? plotDatabases.value.join(",") : null,
    tteTs: plotTimeScales.value.length ? plotTimeScales.value.join(",") : null,
    tteOt: plotOutcomeTypes.value.length
      ? plotOutcomeTypes.value.join(",")
      : null,
    tteTot: plotTargetOutcomeTypes.value.length
      ? plotTargetOutcomeTypes.value.join(",")
      : null,
  });
}

watch(
  [plotDatabases, plotTimeScales, plotOutcomeTypes, plotTargetOutcomeTypes],
  writeTteUrl
);

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
  (data) => {
    if (!data.length) return;
    if (!_urlRestored) {
      _urlRestored = true;
      const url = readUrl();
      const restoreMulti = (
        urlVals: string[] | null,
        opts: string[],
        setter: (v: string[]) => void
      ) => {
        if (urlVals?.length) {
          const valid = urlVals.filter((v) => opts.includes(v));
          setter(valid.length ? valid : [...opts]);
        } else {
          setter([...opts]);
        }
      };
      restoreMulti(
        url.tteDbs,
        uniqueDatabases.value,
        (v) => (plotDatabases.value = v)
      );
      restoreMulti(
        url.tteTs,
        uniqueTimeScales.value,
        (v) => (plotTimeScales.value = v)
      );
      restoreMulti(
        url.tteOt,
        uniqueOutcomeTypes.value,
        (v) => (plotOutcomeTypes.value = v)
      );
      restoreMulti(
        url.tteTot,
        uniqueTargetOutcomeTypes.value,
        (v) => (plotTargetOutcomeTypes.value = v)
      );
      return;
    }
    plotDatabases.value = [...uniqueDatabases.value];
    plotTimeScales.value = [...uniqueTimeScales.value];
    plotOutcomeTypes.value = [...uniqueOutcomeTypes.value];
    plotTargetOutcomeTypes.value = [...uniqueTargetOutcomeTypes.value];
  },
  { immediate: true }
);

onMounted(async () => {
  await nextTick();
  _chartReady = true;
});
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
