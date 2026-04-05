<template>
  <div class="db-comparison">
    <div class="section">
      <div class="controls">
        <div class="control-databases">
          <label>Databases</label>
          <MultiSelect
            v-model="selectedDatabases"
            :options="availableDatabases"
            optionLabel="name"
            optionValue="id"
            placeholder="Select databases"
            filter
            display="chip"
            class="w-full"
          />
        </div>
        <div class="control-threshold">
          <label>Threshold: {{ minThreshold }}</label>
          <Slider
            v-model="minThreshold"
            :min="minCharVal"
            :max="1"
            :step="0.01"
            class="w-full"
          />
        </div>
        <div class="control-action">
          <Button
            label="Generate"
            :disabled="generateDisabled"
            @click="generate"
          />
        </div>
      </div>
    </div>

    <ContextBar
      v-if="showResults"
      :items="[
        targetName,
        lastGeneratedConfig.databases.join(', '),
        `Threshold ${lastGeneratedConfig.threshold}`,
      ]"
    />

    <div v-if="showResults" class="section results-body">
      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in"
        ><div :key="activeResultTab">
          <div v-if="activeResultTab === 0">
            <p class="table-note" v-if="covRef.length">
              Fraction of patients ({{ covRef[0]?.minPriorObservation }}d prior
              obs.) with each binary feature.
            </p>
            <DataTable
              :value="filteredBinaryRows"
              :paginator="true"
              :rows="25"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              sortMode="multiple"
              removableSort
              :striped-rows="store.getters.getSettings.strippedRows"
              size="small"
              class="result-table"
              :exportFilename="'database_comparison_binary'"
            >
              <ColumnGroup type="header">
                <Row>
                  <Column
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="3"
                    sortField="covariateName"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Covariate</span>
                        <FilterInput
                          :filterObj="binaryFilters.covariateName"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="3"
                    sortField="covariateId"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>ID</span>
                        <FilterInput
                          :filterObj="binaryFilters.covariateId"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    v-for="ref in covRef"
                    :key="'hdr-' + ref.id"
                    :header="`${ref.databaseName} (N=${ref.n})`"
                    :colspan="2"
                  />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    v-if="covRef.length === 2"
                    :rowspan="3"
                    sortField="SMD"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>SMD</span>
                        <FilterInput
                          v-if="binaryFilters.SMD"
                          :filterObj="binaryFilters.SMD"
                        />
                      </div>
                    </template>
                  </Column>
                </Row>
                <Row>
                  <template v-for="ref in covRef" :key="'sub-' + ref.id">
                    <Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="Count"
                      :sortField="'sumValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="%"
                      :sortField="'averageValue_' + ref.id"
                      sortable
                    />
                  </template>
                </Row>
                <Row>
                  <template v-for="ref in covRef" :key="'flt-' + ref.id">
                    <Column :pt="{ headerContent: 'justify-end' }">
                      <template #header>
                        <FilterInput
                          v-if="binaryFilters['sumValue_' + ref.id]"
                          :filterObj="binaryFilters['sumValue_' + ref.id]"
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column :pt="{ headerContent: 'justify-end' }">
                      <template #header>
                        <FilterInput
                          v-if="binaryFilters['averageValue_' + ref.id]"
                          :filterObj="binaryFilters['averageValue_' + ref.id]"
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                  </template>
                </Row>
              </ColumnGroup>

              <Column
                style="text-align: start"
                field="covariateName"
                :showFilterMenu="false"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <InputText
                    v-model="filterModel.value"
                    @input="filterCallback()"
                    placeholder="Search..."
                    size="small"
                  />
                </template>
              </Column>
              <Column
                style="text-align: start"
                field="covariateId"
                sortable
                :showFilterMenu="false"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <InputText
                    v-model="filterModel.value"
                    @input="filterCallback()"
                    placeholder="Search..."
                    size="small"
                  />
                </template>
              </Column>
              <template v-for="ref in covRef" :key="'col-' + ref.id">
                <Column
                  style="text-align: end"
                  :field="'sumValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                >
                  <template #body="{ data }">{{
                    formatCount(data["sumValue_" + ref.id])
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
                <Column
                  style="text-align: end"
                  :field="'averageValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                >
                  <template #body="{ data }">{{
                    formatPercent(data["averageValue_" + ref.id])
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
              </template>
              <Column
                style="text-align: end"
                v-if="covRef.length === 2"
                field="SMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  data.SMD != null ? data.SMD.toFixed(4) : ""
                }}</template>
                <template #filter="{ filterModel, filterCallback }">
                  <InputText
                    v-model="filterModel.value"
                    @input="filterCallback()"
                    placeholder="Filter..."
                    size="small"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
          <div v-else-if="activeResultTab === 1">
            <div class="plot-row" v-if="covRef.length >= 2">
              <div>
                <label>X-Axis</label>
                <Dropdown
                  v-model="plotXAxis"
                  :options="covRef"
                  optionLabel="databaseName"
                  optionValue="id"
                  class="w-full"
                />
              </div>
              <div>
                <label>Y-Axis</label>
                <Dropdown
                  v-model="plotYAxis"
                  :options="covRef"
                  optionLabel="databaseName"
                  optionValue="id"
                  class="w-full"
                />
              </div>
              <div class="plot-action">
                <Button label="Plot" @click="showPlot = true" size="small" />
              </div>
            </div>
            <div
              v-if="showPlot && covRef.length >= 2"
              class="scatter-container"
            >
              <Chart
                :data="binaryRows"
                :chart-spec="scatterChartSpec"
                id="db-comparison-scatter"
                height="500px"
              />
            </div>
            <p v-else-if="covRef.length < 2" class="table-note">
              Need at least 2 databases to plot.
            </p>
          </div>

          <div v-else-if="activeResultTab === 2">
            <p class="table-note" v-if="covRef.length">
              Continuous feature distributions ({{
                covRef[0]?.minPriorObservation
              }}d prior obs.) across databases.
            </p>
            <DataTable
              :value="filteredContinuousRows"
              :paginator="true"
              :rows="25"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              sortMode="multiple"
              removableSort
              :striped-rows="store.getters.getSettings.strippedRows"
              size="small"
              class="result-table"
              :exportFilename="'database_comparison_continuous'"
            >
              <ColumnGroup type="header">
                <Row>
                  <Column
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="3"
                    sortField="covariateName"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>Covariate</span>
                        <FilterInput
                          :filterObj="continuousFilters.covariateName"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    :pt="{ headerContent: 'justify-start' }"
                    :rowspan="3"
                    sortField="covariateId"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>ID</span>
                        <FilterInput
                          :filterObj="continuousFilters.covariateId"
                          placeholder="Search..."
                        />
                      </div>
                    </template>
                  </Column>
                  <Column
                    v-for="ref in covRef"
                    :key="'chdr-' + ref.id"
                    :header="`${ref.databaseName} (N=${ref.n})`"
                    :colspan="6"
                  />
                  <Column
                    v-if="covRef.length === 2"
                    :pt="{ headerContent: 'justify-end' }"
                    :rowspan="3"
                    sortField="SMD"
                    sortable
                  >
                    <template #header>
                      <div class="col-header-with-filter">
                        <span>SMD</span>
                        <FilterInput
                          v-if="continuousFilters.SMD"
                          :filterObj="continuousFilters.SMD"
                        />
                      </div>
                    </template>
                  </Column>
                </Row>
                <Row>
                  <template v-for="ref in covRef" :key="'csub-' + ref.id">
                    <Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="Count"
                      :sortField="'countValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="Mean"
                      :sortField="'averageValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="StDev"
                      :sortField="'standardDeviation_' + ref.id"
                      sortable
                    />
                    <Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="Median"
                      :sortField="'medianValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="Min"
                      :sortField="'minValue_' + ref.id"
                      sortable
                    />
                    <Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="Max"
                      :sortField="'maxValue_' + ref.id"
                      sortable
                    />
                  </template>
                </Row>
                <Row>
                  <template v-for="ref in covRef" :key="'cflt-' + ref.id">
                    <Column :pt="{ headerContent: 'justify-end' }">
                      <template #header>
                        <FilterInput
                          v-if="continuousFilters['countValue_' + ref.id]"
                          :filterObj="continuousFilters['countValue_' + ref.id]"
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column :pt="{ headerContent: 'justify-end' }">
                      <template #header>
                        <FilterInput
                          v-if="continuousFilters['averageValue_' + ref.id]"
                          :filterObj="
                            continuousFilters['averageValue_' + ref.id]
                          "
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column :pt="{ headerContent: 'justify-end' }">
                      <template #header>
                        <FilterInput
                          v-if="
                            continuousFilters['standardDeviation_' + ref.id]
                          "
                          :filterObj="
                            continuousFilters['standardDeviation_' + ref.id]
                          "
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column :pt="{ headerContent: 'justify-end' }">
                      <template #header>
                        <FilterInput
                          v-if="continuousFilters['medianValue_' + ref.id]"
                          :filterObj="
                            continuousFilters['medianValue_' + ref.id]
                          "
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column :pt="{ headerContent: 'justify-end' }">
                      <template #header>
                        <FilterInput
                          v-if="continuousFilters['minValue_' + ref.id]"
                          :filterObj="continuousFilters['minValue_' + ref.id]"
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                    <Column :pt="{ headerContent: 'justify-end' }">
                      <template #header>
                        <FilterInput
                          v-if="continuousFilters['maxValue_' + ref.id]"
                          :filterObj="continuousFilters['maxValue_' + ref.id]"
                          input-style="width:100%"
                        />
                      </template>
                    </Column>
                  </template>
                </Row>
              </ColumnGroup>

              <Column field="covariateName" :showFilterMenu="false">
                <template #filter="{ filterModel, filterCallback }">
                  <InputText
                    v-model="filterModel.value"
                    @input="filterCallback()"
                    placeholder="Search..."
                    size="small"
                  />
                </template>
              </Column>
              <Column field="covariateId" sortable :showFilterMenu="false">
                <template #filter="{ filterModel, filterCallback }">
                  <InputText
                    v-model="filterModel.value"
                    @input="filterCallback()"
                    placeholder="Search..."
                    size="small"
                  />
                </template>
              </Column>
              <template v-for="ref in covRef" :key="'ccol-' + ref.id">
                <Column
                  :field="'countValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                >
                  <template #body="{ data }">{{
                    formatCount(data["countValue_" + ref.id])
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
                <Column
                  :field="'averageValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                >
                  <template #body="{ data }">{{
                    formatNum(data["averageValue_" + ref.id])
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
                <Column
                  :field="'standardDeviation_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                >
                  <template #body="{ data }">{{
                    formatNum(data["standardDeviation_" + ref.id])
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
                <Column
                  :field="'medianValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                >
                  <template #body="{ data }">{{
                    formatNum(data["medianValue_" + ref.id])
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
                <Column
                  :field="'minValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                >
                  <template #body="{ data }">{{
                    formatNum(data["minValue_" + ref.id])
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
                <Column
                  :field="'maxValue_' + ref.id"
                  sortable
                  :showFilterMenu="false"
                >
                  <template #body="{ data }">{{
                    formatNum(data["maxValue_" + ref.id])
                  }}</template>
                  <template #filter="{ filterModel, filterCallback }">
                    <InputText
                      v-model="filterModel.value"
                      @input="filterCallback()"
                      placeholder="Filter..."
                      size="small"
                    />
                  </template>
                </Column>
              </template>
              <Column
                v-if="covRef.length === 2"
                field="SMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  data.SMD != null ? data.SMD.toFixed(4) : ""
                }}</template>
                <template #filter="{ filterModel, filterCallback }">
                  <InputText
                    v-model="filterModel.value"
                    @input="filterCallback()"
                    placeholder="Filter..."
                    size="small"
                  />
                </template>
              </Column>
            </DataTable>
          </div></div
      ></Transition>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select at least 2 databases, then click Generate.
    </div>
    <ResultsLoader :loader-state="loaderState" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, toRef } from "vue";

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import MultiSelect from "primevue/multiselect";
import Dropdown from "primevue/dropdown";
import Slider from "primevue/slider";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";

import Chart from "@/widgets/echarts/Echarts.vue";
import FilterInput from "./shared/FilterInput.vue";
import ResultsLoader from "./shared/ResultsLoader.vue";
import ViewToggle from "./shared/ViewToggle.vue";
import ContextBar from "./shared/ContextBar.vue";
import { useAvailableDatabases } from "./shared/useAvailableDatabases";
import { formatPercent, formatCount } from "./shared/formatters";
import { classifyDomain, domainColors } from "./shared/domainColors";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);
const labelColor = computed(() => (darkMode.value ? "#94a3b8" : "#334155"));

const props = defineProps({
  targetRow: { type: Object },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const activeResultTab = ref(0);
const resultTabs = [
  { key: "binary", label: "Binary Table" },
  { key: "plot", label: "Binary Plot" },
  { key: "continuous", label: "Continuous Table" },
];

const loading = ref(false);
const showResults = ref(false);
const loaderState = ref("idle");
const showPlot = ref(false);

const minCharVal = ref(0);
const minThreshold = ref(0.01);
const selectedDatabases = ref([]);

const binaryRows = ref([]);
const continuousRows = ref([]);
const covRef = ref([]);

const plotXAxis = ref(null);
const plotYAxis = ref(null);

const binaryFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const continuousFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const filteredBinaryRows = computed(() => {
  let rows = binaryRows.value;
  for (const [key, filter] of Object.entries(binaryFilters.value)) {
    if (filter.value != null && filter.value !== "") {
      const val = String(filter.value).toLowerCase();
      rows = rows.filter((r) =>
        String(r[key] ?? "")
          .toLowerCase()
          .includes(val)
      );
    }
  }
  return rows;
});

const filteredContinuousRows = computed(() => {
  let rows = continuousRows.value;
  for (const [key, filter] of Object.entries(continuousFilters.value)) {
    if (filter.value != null && filter.value !== "") {
      const val = String(filter.value).toLowerCase();
      rows = rows.filter((r) =>
        String(r[key] ?? "")
          .toLowerCase()
          .includes(val)
      );
    }
  }
  return rows;
});

watch(covRef, (newRefs) => {
  const bin = {
    covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
  const cont = {
    covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
  for (const ref of newRefs) {
    bin[`sumValue_${ref.id}`] = {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    };
    bin[`averageValue_${ref.id}`] = {
      value: null,
      matchMode: FilterMatchMode.CONTAINS,
    };
    for (const f of [
      "countValue",
      "averageValue",
      "standardDeviation",
      "medianValue",
      "minValue",
      "maxValue",
    ]) {
      cont[`${f}_${ref.id}`] = {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      };
    }
  }
  if (newRefs.length === 2) {
    bin.SMD = { value: null, matchMode: FilterMatchMode.CONTAINS };
    cont.SMD = { value: null, matchMode: FilterMatchMode.CONTAINS };
  }
  binaryFilters.value = bin;
  continuousFilters.value = cont;
});

const availableDatabases = useAvailableDatabases(toRef(props, "targetRow"));

const targetName = computed(() => props.targetRow?.cohortName ?? "");

const selectedDatabaseNames = computed(() =>
  availableDatabases.value
    .filter((d) => selectedDatabases.value.includes(d.id))
    .map((d) => d.name)
);

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
    binaryRows.value = [];
    continuousRows.value = [];
    covRef.value = [];
    showPlot.value = false;
  }
);

fetchMinThreshold();

function formatNum(val) {
  if (val == null) return "";
  return val >= 0 ? val.toFixed(3) : `< ${Math.abs(val).toFixed(3)}`;
}

async function fetchMinThreshold() {
  try {
    minCharVal.value = 0.01;
  } catch {
    minCharVal.value = 0;
  }
}

async function fetchBinaryData(targetIds, databaseIds, threshold) {
  const res = await StrategusService.characterization.getCohortBinary(
    targetIds,
    databaseIds,
    threshold
  );
  return res.data;
}

async function fetchContinuousData(targetIds, databaseIds, threshold) {
  const res = await StrategusService.characterization.getCohortContinuous(
    targetIds,
    databaseIds,
    threshold
  );
  return res.data;
}

async function generate() {
  showResults.value = false;
  if (!selectedDatabases.value.length || !props.targetRow) {
    showResults.value = false;
    return;
  }

  loading.value = true;
  loaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const targetIds = [props.targetRow.cohortId];
    const dbIds = selectedDatabases.value;

    const binaryResult = await fetchBinaryData(
      targetIds,
      dbIds,
      minThreshold.value
    );

    if (!binaryResult.covRef?.length) {
      showResults.value = false;
      loaderState.value = "idle";
      return;
    }

    covRef.value = binaryResult.covRef;
    binaryRows.value = binaryResult.covariates;

    if (covRef.value.length >= 2) {
      plotXAxis.value = covRef.value[0].id;
      plotYAxis.value = covRef.value[1].id;
    }

    const continuousResult = await fetchContinuousData(
      targetIds,
      dbIds,
      minThreshold.value
    );
    continuousRows.value = continuousResult.covariates ?? [];

    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showResults.value = true;
    showPlot.value = false;

    lastGeneratedConfig.value = {
      databaseIds: [...selectedDatabases.value],
      databases: availableDatabases.value
        .filter((d) => selectedDatabases.value.includes(d.id))
        .map((d) => d.name),
      threshold: minThreshold.value,
    };
    emit("state-change", {
      databaseIds: selectedDatabases.value,
      ctxItems: [
        ...lastGeneratedConfig.value.databases,
        `Threshold ${minThreshold.value}`,
      ],
    });
  } catch {
    loaderState.value = "error";
  } finally {
    loading.value = false;
  }
}

const scatterChartSpec = computed(() => {
  const xId = plotXAxis.value;
  const yId = plotYAxis.value;

  return ({ data }) => {
    if (xId == null || yId == null || !data?.length) return {};

    const xField = `averageValue_${xId}`;
    const yField = `averageValue_${yId}`;
    const xRef = covRef.value.find((r) => r.id === xId);
    const yRef = covRef.value.find((r) => r.id === yId);

    const domainMap = {};
    for (const row of data) {
      const domain = classifyDomain(row.covariateName);
      if (!domainMap[domain]) domainMap[domain] = [];
      domainMap[domain].push([
        row[xField] ?? 0,
        row[yField] ?? 0,
        row.covariateName,
      ]);
    }

    const series = Object.entries(domainMap).map(([domain, points]) => ({
      name: domain,
      type: "scatter",
      data: points,
      symbolSize: 8,
      itemStyle: { color: domainColors[domain] ?? "#999" },
    }));

    series.push({
      name: "x = y",
      type: "line",
      data: [
        [0, 0],
        [1, 1],
      ],
      symbol: "none",
      lineStyle: { type: "dashed", color: "#000", width: 1 },
      tooltip: { show: false },
    });

    return {
      legend: { right: 0, orient: "vertical", data: Object.keys(domainMap) },
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          if (params.seriesName === "x = y") return "";
          const [x, y, name] = params.data;
          return `<strong>${name}</strong><br/>${xRef?.databaseName}: ${(
            x * 100
          ).toFixed(1)}%<br/>${yRef?.databaseName}: ${(y * 100).toFixed(1)}%`;
        },
      },
      xAxis: {
        name: `${xRef?.databaseName ?? ""} %`,
        nameLocation: "center",
        nameGap: 30,
        min: 0,
        max: 1,
        axisLabel: { formatter: (v) => `${(v * 100).toFixed(0)}%` },
      },
      yAxis: {
        name: `${yRef?.databaseName ?? ""} %`,
        nameLocation: "center",
        nameGap: 40,
        min: 0,
        max: 1,
        axisLabel: { formatter: (v) => `${(v * 100).toFixed(0)}%` },
      },
      series,
    };
  };
});

const lastGeneratedConfig = ref(null);

const generateDisabled = computed(() => {
  if (selectedDatabases.value.length < 2) return true;
  if (!lastGeneratedConfig.value) return false;
  return (
    minThreshold.value === lastGeneratedConfig.value.threshold &&
    selectedDatabases.value.length ===
      lastGeneratedConfig.value.databaseIds.length &&
    selectedDatabases.value.every((id) =>
      lastGeneratedConfig.value.databaseIds.includes(id)
    )
  );
});

onMounted(async () => {
  const url = props.initialUrlState;
  await nextTick();

  const dbs = availableDatabases.value;
  if (url?.databaseIds?.length) {
    const valid = url.databaseIds.filter((id) => dbs.some((d) => d.id === id));
    if (valid.length) selectedDatabases.value = valid;
  }

  if (selectedDatabases.value.length >= 2) {
    await generate();
  }
});
</script>

<style scoped>
@import "./shared/styles.css";

.db-comparison {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.controls {
  display: flex;
  gap: 1.25rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.controls label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: v-bind(labelColor);
}

.control-databases {
  flex: 1;
  min-width: 280px;
  max-width: 500px;
  display: block;
  font-weight: 600;
  font-size: 0.8125rem;
  margin-bottom: 0.25rem;
  color: v-bind(labelColor);
}

.control-threshold {
  min-width: 180px;
  max-width: 250px;
  align-self: center;
  font-size: 0.8125rem;
}

.plot-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  max-width: 500px;
  margin-bottom: 0.75rem;
}

.plot-row > div {
  flex: 1;
  min-width: 130px;
}

.plot-row label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: v-bind(labelColor);
}

.plot-action {
  flex: none !important;
  min-width: auto !important;
  padding-bottom: 1px;
}

.col-header-with-filter {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}
</style>
