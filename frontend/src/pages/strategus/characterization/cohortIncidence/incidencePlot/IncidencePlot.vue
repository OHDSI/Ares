<template>
  <div class="plot-filters">
    <div>
      <label class="field-label">Database</label>
      <MultiSelect
        v-model="plotDatabases"
        :options="uniqueDatabases"
        placeholder="All"
        filter
        display="chip"
        class="w-full"
      />
    </div>
    <div>
      <label class="field-label">Outcome</label>
      <MultiSelect
        v-model="plotOutcomes"
        :options="uniqueOutcomeNames"
        placeholder="All"
        filter
        display="chip"
        class="w-full"
      />
    </div>
    <div>
      <label class="field-label">X-Axis</label>
      <Dropdown v-model="plotXAxis" :options="['Age', 'Year']" class="w-full" />
    </div>
    <div class="strat-checks">
      <div>
        <Checkbox
          v-model="plotSexStratify"
          :binary="true"
          inputId="plotSex"
        /><label for="plotSex">Sex stratify</label>
      </div>
      <div>
        <Checkbox
          v-model="plotFixedY"
          :binary="true"
          inputId="plotFixed"
        /><label for="plotFixed">Fixed y-scale</label>
      </div>
    </div>
  </div>
  <Chart
    v-if="plotData.length"
    :data="plotData"
    :chartSpec="plotChartSpec"
    :height="plotChartHeight"
    id="cohort-incidence"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import Chart from "@/widgets/echarts/echarts";
import {
  cohortIncidenceChartSpec,
  cohortIncidenceChartHeight,
} from "../chartSpec";
import MultiSelect from "primevue/multiselect";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import { useCharacterizationUrl } from "@/shared/lib/composables/useCharacterizationUrl";

const props = defineProps<{
  data: any[];
  darkMode: boolean;
}>();

const { readUrl, patchUrl } = useCharacterizationUrl();

const plotDatabases = ref<string[]>([]);
const plotOutcomes = ref<string[]>([]);
const plotXAxis = ref("Age");
const plotSexStratify = ref(false);
const plotFixedY = ref(true);
let _chartReady = false;
let _urlRestored = false;

function writeCipUrl() {
  if (!_chartReady) return;
  patchUrl({
    cipDbs: plotDatabases.value.length ? plotDatabases.value.join(",") : null,
    cipOuts: plotOutcomes.value.length ? plotOutcomes.value.join(",") : null,
    cipX: plotXAxis.value !== "Age" ? plotXAxis.value : null,
    cipSex: plotSexStratify.value ? "1" : null,
    cipFixY: !plotFixedY.value ? "0" : null,
  });
}

watch(
  [plotDatabases, plotOutcomes, plotXAxis, plotSexStratify, plotFixedY],
  writeCipUrl
);

const uniqueDatabases = computed(() =>
  [...new Set(props.data.map((r) => r.databaseName))].sort()
);
const uniqueOutcomeNames = computed(() =>
  [...new Set(props.data.map((r) => r.outcomeName))].sort()
);

const plotData = computed(() => {
  let data = props.data;

  if (plotXAxis.value === "Age") {
    data = data.filter(
      (r) => r.ageGroupName !== "Any" && r.startYear === "Any"
    );
  } else {
    data = data.filter(
      (r) => r.ageGroupName === "Any" && r.startYear !== "Any"
    );
  }

  if (!plotSexStratify.value) data = data.filter((r) => r.genderName === "Any");
  else data = data.filter((r) => r.genderName !== "Any");

  if (plotDatabases.value.length)
    data = data.filter((r) => plotDatabases.value.includes(r.databaseName));
  if (plotOutcomes.value.length)
    data = data.filter((r) => plotOutcomes.value.includes(r.outcomeName));

  return data;
});

const plotChartHeight = computed(() =>
  cohortIncidenceChartHeight(plotData.value)
);

const plotChartSpec = computed(
  () =>
    ({ data }) =>
      cohortIncidenceChartSpec({
        data,
        plotXAxis: plotXAxis.value,
        plotSexStratify: plotSexStratify.value,
        plotFixedY: plotFixedY.value,
      })
);

watch(
  () => props.data,
  (data) => {
    if (!data.length) return;
    if (!_urlRestored) {
      _urlRestored = true;
      const url = readUrl();
      if (url.cipDbs?.length) plotDatabases.value = url.cipDbs;
      if (url.cipOuts?.length) plotOutcomes.value = url.cipOuts;
      return;
    }
    plotDatabases.value = [];
    plotOutcomes.value = [];
  },
  { immediate: true }
);

onMounted(async () => {
  const url = readUrl();
  if (url.cipX) plotXAxis.value = url.cipX;
  plotSexStratify.value = url.cipSex;
  plotFixedY.value = url.cipFixY;
  await nextTick();
  _chartReady = true;
});
</script>

<style scoped>
@import "../../shared/styles.css";

.plot-filters {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.plot-filters > div {
  min-width: 150px;
  flex: 1;
}

.strat-checks {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.strat-checks > div {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
}
</style>
