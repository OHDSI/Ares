<template>
  <div class="flex flex-col gap-5">
    <Panel header="Network Comparison Tool">
      <div class="flex flex-col gap-5 py-4 px-4 min-h-[630px]">
        <div class="flex flex-row gap-5">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Sources</label>
            <TreeSelect
              unstyled
              style="max-width: 200px"
              v-model="selectedFilterAttributes"
              :options="getSourceOptions"
              :meta-key-selection="false"
              selectionMode="checkbox"
              placeholder="Select Sources"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Report</label>
            <Dropdown
              option-label="name"
              option-value="value"
              @update:modelValue="changeSelectedReport"
              :model-value="selectedReport"
              :options="reports"
              placeholder="Select report"
            ></Dropdown>
          </div>
          <div v-if="availableOptions" class="flex flex-col gap-1">
            <label class="text-sm font-medium">Domain</label>
            <Dropdown
              placeholder="Select domain"
              option-label="name"
              option-value="value"
              @update:modelValue="changeSelectedDomain"
              :model-value="selectedDomain"
              :options="availableOptions"
            ></Dropdown>
          </div>
          <div v-if="sources.length" class="flex flex-col gap-1">
            <label class="text-sm font-medium">Reference</label>
            <Dropdown
              v-model="referenceKey"
              showClear
              option-label="name"
              option-value="value"
              :options="referenceOptions"
              placeholder="None"
            ></Dropdown>
          </div>
        </div>
        <div
          v-if="dataLoaderState !== 'idle'"
          class="flex justify-center h-[500px] items-center"
        >
          <BlackHoleLoader
            :escalate="true"
            text="Loading comparison data..."
            size="lg"
            :state="dataLoaderState"
          />
        </div>
        <div
          v-else-if="Object.keys(dataSources).length"
          class="flex flex-col gap-8"
        >
          <div v-if="activeDescriptor.kpis?.length" class="flex flex-col gap-2">
            <h3 class="text-lg font-medium">Summary</h3>
            <table>
              <thead>
                <tr>
                  <th class="rowNameCol">Metric</th>
                  <th
                    class="text-right sourceGroup"
                    :class="{
                      'reference-border-x reference-header':
                        source === referenceKey,
                    }"
                    v-for="source in sources"
                    :key="source"
                  >
                    {{ source }}
                    <span
                      v-if="source === referenceKey"
                      class="ml-1 text-xs font-medium text-blue-500 dark:text-blue-400"
                      >(reference)</span
                    >
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="kpi in activeDescriptor.kpis" :key="kpi.value">
                  <td class="rowNameCol">{{ kpi.name }}</td>
                  <td
                    v-for="source in sources"
                    :key="source"
                    :class="`text-right ${formatKpiCell(source, kpi).className} ${
                      source === referenceKey ? 'reference-border-x' : ''
                    }`"
                  >
                    {{ formatKpiCell(source, kpi).display }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-for="panel in activeDescriptor.panels"
            :key="`${selectedReport}-${selectedDomain}-${panel.name}`"
            class="flex flex-col gap-2"
          >
            <h3
              v-if="activeDescriptor.panels.length > 1"
              class="text-lg font-medium"
            >
              {{ panel.name }}
            </h3>
            <ComparisonPanelTable
              v-if="panel.kind === 'table'"
              :panel="panel"
              :data-sources="dataSources"
              :sources="sources"
              :reference-key="referenceKey"
              :get-drilldown-route="getDrilldownRoute"
              :get-index-table-route="getIndexTableRoute"
              @drilldown="loadDrilldown"
            />
            <ComparisonOverlayChart
              v-else-if="panel.kind === 'overlay-chart'"
              :panel="panel"
              :data-sources="dataSources"
              :sources="sources"
            />
            <SmallMultiplesGrid
              v-else-if="panel.kind === 'small-multiples'"
              :panel="panel"
              :data-sources="dataSources"
              :sources="sources"
              :reference-key="referenceKey"
            />
          </div>
        </div>
        <div v-else class="flex justify-center h-[500px] items-center text-2xl">
          {{
            hasSelectedSources && Object.keys(sourceErrors).length
              ? "All selected sources failed to load for this report"
              : "Add at least one data source to display the results"
          }}
        </div>
        <Message
          v-if="Object.keys(sourceErrors).length"
          severity="warn"
          :closable="false"
        >
          {{ sourceErrorSummary }}
        </Message>
      </div>
    </Panel>

    <div class="card flex justify-content-center">
      <Sidebar
        header="Network Concept Report"
        :pt="{
          header: [
            'flex',
            'flex-row justify-between',
            'px-14',
            'md:px-20',
            'lg:px-24',
            'mx-6',
            'my-5',
          ],
        }"
        v-model:visible="visible"
        :position="drillDownViewOption?.position"
        :class="drillDownViewOption?.class"
      >
        <div class="px-14 md:px-20 lg:px-24 mx-1 h-[90%]">
          <NetworkConceptReport v-if="conceptData" :data="conceptData" />
          <div class="flex justify-center items-center h-full" v-else>
            <!--            <AnimatedLogo />-->
            <BlackHoleLoader
              :escalate="true"
              text="Fetching..."
              size="lg"
              :state="drilldownLoaderState"
            />
          </div>
        </div>
      </Sidebar>
    </div>
  </div>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import Dropdown from "primevue/dropdown";
import Sidebar from "primevue/sidebar";
import Message from "primevue/message";

import { useStore } from "vuex";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/processes/exploreReports/model/store/actions.type";
import apiService from "@/shared/api/axios/apiService";
import getFilePath from "@/shared/api/axios/files";
import getDuckDBFilePath from "@/shared/api/duckdb/files";
import db from "@/shared/api/duckdb/instance";
import { csvParse } from "@/shared/lib/utils";
import { computed, onMounted, ref, watch } from "vue";
import {
  COHORT_INDEX,
  CONCEPT,
  COST_DOMAIN_SUMMARY,
  DOMAIN_SUMMARY,
} from "@/shared/config/files";
import { useRoute, useRouter } from "vue-router";
import TreeSelect from "primevue/treeselect";
import NetworkConceptReport from "./conceptDrilldown";
import environment from "@/shared/api/environment";
import getDuckDBTables from "@/shared/api/duckdb/conceptTables";
import AnimatedLogo from "@/shared/assets/AnimatedLogo.vue";
import concept from "@/processes/exploreReports/model/store/postprocessing/conceptReport";
import BlackHoleLoader from "@/shared/ui/blackHoleLoader";
import ComparisonPanelTable from "./ComparisonPanelTable.vue";
import ComparisonOverlayChart from "./ComparisonOverlayChart.vue";
import SmallMultiplesGrid from "./charts/SmallMultiplesGrid.vue";
import {
  comparisonRegistry,
  getComparableReports,
  postprocessingRegistry,
} from "@/processes/exploreReports/config/viewRegistry";
import {
  computeDelta,
  deltaColor,
  formatDeltaPercent,
  formatDeltaPoints,
} from "./lib/delta";
const route = useRoute();
const store = useStore();
const router = useRouter();

const conceptData = ref(null);
const visible = ref(false);
const drilldownLoaderState = ref("idle");
const dataLoaderState = ref("idle");

const drillDownViewOption = computed(
  () => store.getters.getSettings.drillDownViewOptions,
);

const changeSelectedReport = function (val) {
  router.replace({ name: route.name });
  selectedReport.value = val;
};

const selectedFilterAttributes = ref({});

const getSourceOptions = computed(() => {
  return availableSources.map((source, index) => {
    return {
      key: index,
      label: source.cdm_source_key,
      data: source.cdm_source_key,
      children: source.releases.map((value, valIndex) => {
        return {
          key: `${index}-${valIndex}`,
          label: value.release_name,
          data: value.release_id,
        };
      }),
    };
  });
});

const getParsedSelectedSources = computed(() => {
  const keys = Object.keys(selectedFilterAttributes.value);
  return keys.reduce((acc, current) => {
    if (current.includes("-")) {
      const keyArray = current.split("-");
      const attribute = keyArray[0];
      const value = keyArray[1];
      return {
        ...acc,
        [getSourceOptions.value[attribute].data]: [
          ...(Array.isArray(acc[getSourceOptions.value[attribute].data])
            ? acc[getSourceOptions.value[attribute].data]
            : []),
          getSourceOptions.value[attribute].children[value].data,
        ],
      };
    } else {
      return { ...acc };
    }
  }, {});
});

watch(getParsedSelectedSources, async () => {
  const currentSources = new Set(
    Object.keys(getParsedSelectedSources.value).flatMap((source) =>
      getParsedSelectedSources.value[source].map(
        (release) => `${source}-${release}`,
      ),
    ),
  );

  Object.keys(dataSources.value).forEach((key) => {
    if (!currentSources.has(key)) {
      delete dataSources.value[key];
    }
  });
  Object.keys(sourceErrors.value).forEach((key) => {
    if (!currentSources.has(key)) {
      delete sourceErrors.value[key];
    }
  });

  const toLoad: { source: string; release: string }[] = [];
  Object.keys(getParsedSelectedSources.value).forEach((source) => {
    getParsedSelectedSources.value[source].forEach((release) => {
      if (!dataSources.value[`${source}-${release}`]) {
        toLoad.push({ source, release });
      }
    });
  });

  await loadSourcesSafely(toLoad);
});

const activeDescriptor = computed(
  () => comparisonRegistry[selectedReport.value],
);

const availableSources = store.getters.getSources;
const dataSources = ref({});
const sourceErrors = ref<Record<string, string>>({});

const sourceErrorSummary = computed(() => {
  const byReason = new Map<string, string[]>();
  Object.entries(sourceErrors.value).forEach(([key, message]) => {
    if (!byReason.has(message)) byReason.set(message, []);
    byReason.get(message)!.push(key);
  });

  return Array.from(byReason.entries())
    .map(([message, keys]) => `${message}: ${keys.join(", ")}`)
    .join("; ");
});

const sources = computed(() => {
  const keys = Object.keys(dataSources.value);
  if (!referenceKey.value || !keys.includes(referenceKey.value)) {
    return keys;
  }
  return [
    referenceKey.value,
    ...keys.filter((key) => key !== referenceKey.value),
  ];
});
const hasSelectedSources = computed(() =>
  Object.values(getParsedSelectedSources.value).some(
    (releases: string[]) => releases.length,
  ),
);

const referenceKey = ref(null);

watch(sources, (newSources) => {
  if (referenceKey.value && !newSources.includes(referenceKey.value)) {
    referenceKey.value = null;
  }
});

const referenceOptions = computed(() =>
  sources.value.map((source) => ({ name: source, value: source })),
);

function getDrilldownRoute(cdmRelease: string, rowId: string | number) {
  const [cdm, release] = cdmRelease.split("-");
  const domain = selectedDomain.value;
  let paramsObject;

  if (
    selectedReport.value === DOMAIN_SUMMARY ||
    selectedReport.value === COST_DOMAIN_SUMMARY
  ) {
    paramsObject = { cdm, release, concept: rowId, domain };
  } else {
    paramsObject = { cdm, release, cohort_id: rowId };
  }
  return {
    name: activeDescriptor.value.indexTableName,
    params: paramsObject,
  };
}

async function loadDrilldown(concept) {
  visible.value = true;
  conceptData.value = null;
  drilldownLoaderState.value = "loading";
  const loadStart = Date.now();
  const domain = selectedDomain.value;
  const conceptId = concept.CONCEPT_ID;
  const files = environment.DUCKDB_ENABLED
    ? getDuckDBTables({
        domain,
        concept: conceptId,
      })[domain]
    : [
        {
          name: CONCEPT,
          instanceParams: [{ domain, concept: conceptId }],
        },
      ];
  try {
    await store.dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
      files: files,
      duckdb_supported: true,
      defaultSources: getParsedSelectedSources.value,
    });
    if (Date.now() - loadStart >= 600) {
      drilldownLoaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    drilldownLoaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    conceptData.value = store.getters.getData;
  } catch {
    drilldownLoaderState.value = "error";
  }
}

function getIndexTableRoute(cdmRelease: string) {
  const domain = selectedDomain.value;

  const [cdm, release] = cdmRelease.split("-");
  const paramsObject = { cdm, release, domain };
  return {
    name: activeDescriptor.value.indexTableName,
    params: paramsObject,
  };
}

function formatKpiCell(source: string, kpi) {
  const sourceShaped = dataSources.value[source];
  const raw = sourceShaped?.[kpi.value];
  const display =
    raw !== undefined && raw !== null
      ? kpi.processingFunction
        ? kpi.processingFunction(raw)
        : raw
      : "N/A";

  if (!referenceKey.value || source === referenceKey.value) {
    return { display, className: "" };
  }

  const referenceShaped = dataSources.value[referenceKey.value];
  const delta = computeDelta(referenceShaped, sourceShaped, kpi);
  const deltaValue =
    kpi.unit === "percent" ? delta.deltaPoints : delta.deltaPercent;
  const deltaText =
    kpi.unit === "percent"
      ? formatDeltaPoints(delta.deltaPoints)
      : formatDeltaPercent(delta.deltaPercent);

  return {
    display: deltaText === "N/A" ? display : `${display} (${deltaText})`,
    className: deltaColor(deltaValue),
  };
}

const selectedDomain = ref(null);

const changeSelectedDomain = function (val) {
  router.replace({ name: route.name });
  selectedDomain.value = val;
};

const selectedReport = ref(null);

const newSourceForm = ref(false);

const reports = getComparableReports();

const availableOptions = computed(() => {
  return comparisonRegistry[selectedReport.value]?.domainOptions;
});

async function fetchOneFile({
  cdm,
  release,
  domain,
  file,
  duckdbSupported,
}: {
  cdm: string;
  release: string;
  domain: string;
  file: string;
  duckdbSupported?: boolean;
}): Promise<unknown> {
  const isDuckDb = environment.DUCKDB_ENABLED && duckdbSupported;

  if (isDuckDb) {
    const c = await db.connect();
    const result = await c.query(
      `SELECT * FROM read_parquet('${getDuckDBFilePath({ cdm, release })[file]}')`,
    );
    const data: unknown[] = [];
    for (const row of result) {
      const rowData: Record<string, unknown> = {};
      for (const colName in row) {
        if (Object.prototype.hasOwnProperty.call(row, colName)) {
          rowData[colName] = row[colName];
        }
      }
      data.push(rowData);
    }
    return data;
  }

  const response = await apiService(
    {
      url: getFilePath({ cdm, release, domain })[file],
      method: "get",
    },
    {},
  );
  return typeof response.data === "string"
    ? csvParse(response.data)
    : response.data;
}

const loadData = async function (
  cdm: string,
  release: string,
  domain: string,
): Promise<[string, unknown]> {
  const descriptor = comparisonRegistry[selectedReport.value];

  const rawByFile: Record<string, unknown> = {};
  await Promise.all(
    descriptor.files.map(async (file) => {
      rawByFile[file] = await fetchOneFile({
        cdm,
        release,
        domain,
        file,
        duckdbSupported: descriptor.duckdbSupported,
      });
    }),
  );

  const postprocessor = postprocessingRegistry[descriptor.viewName];
  const shaped = postprocessor ? postprocessor(rawByFile) : rawByFile;

  return [`${cdm}-${release}`, shaped];
};

function describeLoadError(error: unknown): string {
  const status = (error as any)?.response?.status;
  if (status === 404) {
    return "Not available for this report";
  }
  return (error as any)?.message || "Failed to load";
}

async function loadSourcesSafely(
  toLoad: { source: string; release: string }[],
) {
  if (!toLoad.length) return;

  const loadStart = Date.now();
  dataLoaderState.value = "loading";

  const settled = await Promise.allSettled(
    toLoad.map(({ source, release }) =>
      loadData(source, release, selectedDomain.value),
    ),
  );

  settled.forEach((result, index) => {
    const { source, release } = toLoad[index];
    const key = `${source}-${release}`;
    if (result.status === "fulfilled") {
      dataSources.value[key] = result.value[1];
      delete sourceErrors.value[key];
    } else {
      delete dataSources.value[key];
      sourceErrors.value[key] = describeLoadError(result.reason);
    }
  });

  if (Date.now() - loadStart >= 600) {
    dataLoaderState.value = "success";
    await new Promise((r) => setTimeout(r, 1100));
  }
  dataLoaderState.value = "idle";
}

const fetchMultiple = async function (sources) {
  newSourceForm.value = false;
  await loadSourcesSafely(sources);
};

function reloadData() {
  const toLoad: { source: string; release: string }[] = [];
  Object.keys(getParsedSelectedSources.value).forEach((source) => {
    getParsedSelectedSources.value[source].forEach((release) => {
      toLoad.push({ source, release });
    });
  });
  dataSources.value = {};
  sourceErrors.value = {};
  fetchMultiple(toLoad);
}

watch(selectedReport, () => {
  const { cdm, release, domain, report } = route.query;
  if (cdm || release || domain || report) {
    return;
  } else {
    if (selectedReport.value === DOMAIN_SUMMARY) {
      selectedDomain.value =
        comparisonRegistry[DOMAIN_SUMMARY].domainOptions[0].value;
    }
    if (selectedReport.value === COST_DOMAIN_SUMMARY) {
      selectedDomain.value =
        comparisonRegistry[COST_DOMAIN_SUMMARY].domainOptions[0].value;
    }
    conceptData.value = null;
    reloadData();
  }
});
watch(selectedDomain, () => {
  reloadData();
  conceptData.value = null;
});

//Handle loading of the data if redirected

function populateSelectedAttributesFromParams() {
  const { cdm, release } = route.query;
  const attributes = {};

  if (cdm && release) {
    availableSources.forEach((source, index) => {
      if (source.cdm_source_key === cdm) {
        source.releases.forEach((rel, relIndex) => {
          if (rel.release_id === release) {
            attributes[`${index}-${relIndex}`] = {
              partialChecked: false,
              checked: true,
            };
          }
        });
      }
    });
  }
  selectedFilterAttributes.value = attributes;
}

function parseSourceToSelectedAttributes(parsedData) {
  const attributes = {};

  Object.keys(parsedData).forEach((sourceName) => {
    const sourceIndex = availableSources.findIndex(
      (source) => source.cdm_source_key === sourceName,
    );

    // check if exists in available sources
    if (sourceIndex !== -1) {
      const parsedReleases = parsedData[sourceName];
      const availableReleases = availableSources[sourceIndex].releases;

      parsedReleases.forEach((releaseName) => {
        const releaseIndex = availableReleases.findIndex(
          (release) => release.release_id === releaseName,
        );
        if (releaseIndex !== -1) {
          const key = `${sourceIndex}-${releaseIndex}`;
          attributes[key] = { partialChecked: false, checked: true };
        }
      });

      const allReleasesChecked = availableReleases.every((release) =>
        parsedReleases.includes(release.release_id),
      );

      attributes[sourceIndex] = {
        partialChecked: !allReleasesChecked,
        checked: allReleasesChecked,
      };
    }
  });
  return attributes;
}

onMounted(() => {
  const { report, domain } = route.query;
  if (report === "domain") {
    selectedDomain.value = domain;
    selectedReport.value = DOMAIN_SUMMARY;
  } else if (report === "cohort") {
    selectedReport.value = COHORT_INDEX;
  } else if (report === "cost") {
    selectedReport.value = COST_DOMAIN_SUMMARY;
  } else {
    selectedDomain.value =
      comparisonRegistry[DOMAIN_SUMMARY].domainOptions[0].value;

    selectedReport.value = reports[0].value;
  }
  populateSelectedAttributesFromParams();
  const defaultSource = store.getters.getSettings.defaultSources || {};
  selectedFilterAttributes.value = {
    ...selectedFilterAttributes.value,
    ...parseSourceToSelectedAttributes(defaultSource),
  };
});

onMounted(() => {
  const { concept, domain } = route.query;
  if (concept && domain) {
    selectedDomain.value = domain;
    loadDrilldown({ CONCEPT_ID: concept });
  }
});

watch(visible, () => {
  const { domain, concept, report } = route.query;
  if (visible.value === false)
    if (domain || concept || report) {
      router.replace({ name: route.name });
    }
});
</script>

<style scoped>
.sort-indicator {
  font-size: 1rem;
  transition: opacity 0.2s;
}

.sort-indicator.inactive {
  opacity: 0.5;
}

.sort-indicator.active {
  opacity: 0.8;
}

th.cursor-pointer:hover .sort-indicator.inactive {
  opacity: 0.9;
}

th.cursor-pointer:hover .sort-indicator.active {
  opacity: 1;
}

th.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark th.cursor-pointer:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

th {
  white-space: nowrap;
}

th > div {
  white-space: nowrap;
}

.rowNameCol {
  text-align: left;
  position: sticky;
  left: 0;
  min-width: 100px;
  transition: background-color 0.15s linear;
}
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  padding: 8px;
  @apply border dark:border-surface-700 border-surface-200;
}

th,
tr {
  @apply border-b dark:border-surface-700 border-surface-200;
}

.rowNameCol.scrolled {
  background-color: var(--color-border-subtle);
}

.reference-border-x {
  border-left: 3px solid #3b82f6 !important;
  border-right: 3px solid #3b82f6 !important;
}

.dark .reference-border-x {
  border-left-color: #60a5fa !important;
  border-right-color: #60a5fa !important;
}

.reference-header {
  font-weight: 600;
}
</style>
