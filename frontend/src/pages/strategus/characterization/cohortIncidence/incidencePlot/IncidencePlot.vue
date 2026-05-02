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
import { ref, computed, watch } from "vue";
import Chart from "@/widgets/echarts/echarts";
import {
  cohortIncidenceChartSpec,
  cohortIncidenceChartHeight,
} from "../chartSpec";
import MultiSelect from "primevue/multiselect";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";

const props = defineProps<{
  data: any[];
  darkMode: boolean;
}>();

const plotDatabases = ref<string[]>([]);
const plotOutcomes = ref<string[]>([]);
const plotXAxis = ref("Age");
const plotSexStratify = ref(false);
const plotFixedY = ref(true);

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
  () => {
    plotDatabases.value = [];
    plotOutcomes.value = [];
  }
);
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
