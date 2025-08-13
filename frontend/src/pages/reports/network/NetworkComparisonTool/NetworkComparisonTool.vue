<template>
  <div class="flex flex-col gap-5">
    <Panel header="Network Comparison Tool">
      <div class="flex flex-col gap-5 py-4 px-4 min-h-[630px]">
        <div class="flex flex-row gap-5">
          <InputGroup class="flex-grow" unstyled>
            <InputGroupAddon>
              <i class="pi pi-search"></i>
            </InputGroupAddon>
            <InputText
              class="rounded-r-lg"
              unstyled
              v-model="search"
              placeholder="Search in Table"
            />
          </InputGroup>
          <TreeSelect
            unstyled
            style="max-width: 200px"
            v-model="selectedFilterAttributes"
            :options="getSourceOptions"
            :meta-key-selection="false"
            selectionMode="checkbox"
            placeholder="Select Sources"
          />
          <Dropdown
            option-label="name"
            option-value="value"
            @update:modelValue="changeSelectedReport"
            :model-value="selectedReport"
            :options="reports"
            placeholder="Select report"
          ></Dropdown>
          <Dropdown
            v-if="availableOptions"
            placeholder="Select domain"
            option-label="name"
            option-value="value"
            @update:modelValue="changeSelectedDomain"
            :model-value="selectedDomain"
            :options="availableOptions"
          ></Dropdown>
        </div>
        <div class="flex flex-col gap-5" v-if="Object.keys(dataSources).length">
          <div ref="tableContainer" class="overflow-x-scroll table-container">
            <table>
              <thead>
                <tr>
                  <th
                    class="rowNameCol"
                    :class="{ scrolled: isScrolled }"
                    rowspan="2"
                  >
                    {{ selectedConfig.rowHeader.name }}
                  </th>
                  <th
                    class="sourceGroup"
                    v-for="source in sources"
                    :colspan="selectedConfig.group.children.length"
                    :key="source"
                  >
                    <router-link
                      class="text-blue-400 hover:underline"
                      :to="getIndexTableRoute(source)"
                      >{{ source }}
                    </router-link>
                  </th>
                </tr>
                <tr>
                  <template v-for="source in sources" :key="source">
                    <th
                      class="text-right sourceGroup"
                      v-for="child in selectedConfig.group.children"
                      :key="child.name"
                    >
                      {{ child.name }}
                    </th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(rowName, index) in slicedArray"
                  :key="rowName"
                  :class="
                    !(index % 2) && stripedRows
                      ? 'dark:bg-surface-650 bg-surface-50'
                      : ''
                  "
                >
                  <td :class="{ scrolled: isScrolled }" class="rowNameCol">
                    <a
                      v-if="selectedConfig.showDrillDown"
                      class="cursor-pointer"
                      @click="loadDrilldown(rowName)"
                    >
                      {{ rowName[selectedConfig.rowHeader.value] }}
                    </a>
                    <span v-else>
                      {{ rowName[selectedConfig.rowHeader.value] }}
                    </span>
                  </td>
                  <template v-for="source in sources" :key="source">
                    <td
                      :class="`text-right ${
                        index === 0
                          ? 'border-l border-surface-100'
                          : 'border-r border-surface-100'
                      }`"
                      v-for="(child, index) in selectedConfig.group.children"
                      :key="child.value"
                    >
                      <router-link
                        v-if="
                          child.link &&
                          getSourceData(source, rowName)[selectedConfig.rowId]
                        "
                        class="text-blue-400 hover:underline"
                        :to="
                          getDrilldownRoute(
                            source,
                            getSourceData(source, rowName)[selectedConfig.rowId]
                          )
                        "
                        >{{
                          getSourceData(source, rowName)[child.value]
                            ? child.processingFunction
                              ? child.processingFunction(
                                  getSourceData(source, rowName)[child.value]
                                )
                              : getSourceData(source, rowName)[child.value]
                            : "N/A"
                        }}
                      </router-link>
                      <span v-else>
                        {{
                          getSourceData(source, rowName)[child.value]
                            ? child.processingFunction
                              ? child.processingFunction(
                                  getSourceData(source, rowName)[child.value]
                                )
                              : getSourceData(source, rowName)[child.value]
                            : "N/A"
                        }}
                      </span>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
          <Paginator
            v-model:first="first"
            :rows="step"
            :totalRecords="filteredResults.length"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
          />
        </div>
        <div v-else class="flex justify-center h-[500px] items-center text-2xl">
          Add at least one data source to display the results
        </div>
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
            <AnimatedLogo />
          </div>
        </div>
      </Sidebar>
    </div>
  </div>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import Paginator from "primevue/paginator";
import Dropdown from "primevue/dropdown";
import Sidebar from "primevue/sidebar";

import { useStore } from "vuex";
import {
  FETCH_FILES,
  FETCH_MULTIPLE_FILES_BY_SOURCE,
} from "@/processes/exploreReports/model/store/actions.type";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  COHORT_INDEX,
  CONCEPT,
  COST_DOMAIN_SUMMARY,
  DOMAIN_SUMMARY,
} from "@/shared/config/files";
import { helpers } from "@/shared/lib/mixins";
import InputText from "primevue/inputtext";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import { useRoute, useRouter } from "vue-router";
import TreeSelect from "primevue/treeselect";
import NetworkConceptReport from "./conceptDrilldown/NetworkConceptReport.vue";
import environment from "@/shared/api/environment";
import getDuckDBTables from "@/shared/api/duckdb/conceptTables";
import AnimatedLogo from "@/shared/assets/AnimatedLogo.vue";
import concept from "@/processes/exploreReports/model/store/postprocessing/conceptReport";
const route = useRoute();
const store = useStore();
const router = useRouter();

const first = ref(0);
const search = ref(null);
const step = ref(10);

const conceptData = ref(null);
const visible = ref(false);

const drillDownViewOption = computed(
  () => store.getters.getSettings.drillDownViewOptions
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
        (release) => `${source}-${release}`
      )
    )
  );

  Object.keys(dataSources.value).forEach((key) => {
    if (!currentSources.has(key)) {
      delete dataSources.value[key];
    }
  });

  Object.keys(getParsedSelectedSources.value).forEach((source) => {
    getParsedSelectedSources.value[source].forEach((release) => {
      if (!dataSources.value[`${source}-${release}`]) {
        loadData(source, release, selectedDomain.value);
      }
    });
  });
});

const stripedRows = computed(() => {
  return store.getters.getSettings.strippedRows;
});

const selectedConfig = computed(() => {
  return reportColumnNames[selectedReport.value];
});

const availableSources = store.getters.getSources;
const dataSources = ref({});
const getSourceData = (source, rowName) => {
  return (
    dataSources.value[source].find(
      (item) =>
        item[selectedConfig.value.rowHeader.value] ===
        rowName[selectedConfig.value.rowHeader.value]
    ) || {}
  );
};
const sources = computed(() => Object.keys(dataSources.value));

const rowNames = computed(() => {
  const uniqueMap = new Map();
  Object.values(dataSources.value)
    .flat()
    .forEach((item) => {
      const key = item[selectedConfig.value.rowHeader.value];
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });
  return Array.from(uniqueMap.values());
});

const filteredResults = computed(() => {
  if (search.value && search.value.length) {
    return rowNames.value.filter((val) =>
      val[selectedConfig.value.rowHeader.value]
        .toLowerCase()
        .includes(search.value.toLowerCase())
    );
  } else {
    return rowNames.value;
  }
});

const slicedArray = computed(() => {
  const start = first.value;
  const end = start + step.value;
  return filteredResults.value.slice(start, end);
});

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
    name: selectedConfig.value.indexTableName,
    params: paramsObject,
  };
}

async function loadDrilldown(concept) {
  visible.value = true;
  conceptData.value = null;
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
  await store.dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
    files: files,
    duckdb_supported: true,
    defaultSources: getParsedSelectedSources.value,
  });
  conceptData.value = store.getters.getData;
}

function getIndexTableRoute(cdmRelease: string) {
  const domain = selectedDomain.value;

  const [cdm, release] = cdmRelease.split("-");
  const paramsObject = { cdm, release, domain };
  return {
    name: selectedConfig.value.indexTableName,
    params: paramsObject,
  };
}

const selectedDomain = ref(null);

const changeSelectedDomain = function (val) {
  router.replace({ name: route.name });
  selectedDomain.value = val;
};

const selectedReport = ref(null);

const newSourceForm = ref(false);

const reports = [
  {
    name: "Domain Table",
    value: DOMAIN_SUMMARY,
  },
  {
    name: "Cohort Table",
    value: COHORT_INDEX,
  },
  {
    name: "Cost Table",
    value: COST_DOMAIN_SUMMARY,
  },
];

const domainSummary = [
  { name: "Condition Occurrence", value: "condition_occurrence" },
  { name: "Condition Era", value: "condition_era" },
  { name: "Drug Exposure", value: "drug_exposure" },
  { name: "Drug Eras", value: "drug_era" },
  { name: "Visit Occurrence", value: "visit_occurrence" },
  { name: "Visit Detail", value: "visit_detail" },
  { name: "Measurements", value: "measurement" },
  { name: "Observations", value: "observation" },
  { name: "Procedure Occurrence", value: "procedure_occurrence" },
  { name: "Device Exposure", value: "device_exposure" },
];

const costDomainSummary = [
  { name: "Drug", value: "drug" },
  { name: "Visits", value: "visit" },
  { name: "Procedures", value: "procedure" },
];

const availableOptions = computed(() => {
  const currentReport = selectedReport.value;
  const reportDomainLists = {
    [DOMAIN_SUMMARY]: domainSummary,
    [COST_DOMAIN_SUMMARY]: costDomainSummary,
  };
  return reportDomainLists[currentReport];
});

const reportColumnNames = {
  [DOMAIN_SUMMARY]: {
    rowHeader: { name: "Concept Name", value: "CONCEPT_NAME" },
    rowId: "CONCEPT_ID",
    drillDownRouteName: "domainTable",
    indexTableName: "domainTable",
    showDrillDown: true,
    group: {
      name: "Source",
      value: "source",
      children: [
        {
          name: "# Persons",
          value: "NUM_PERSONS",
          link: true,
          processingFunction: helpers.formatComma,
        },
        {
          name: "% Persons",
          value: "PERCENT_PERSONS",
          processingFunction: helpers.formatPercent,
        },
      ],
    },
  },
  [COHORT_INDEX]: {
    rowHeader: { name: "Cohort Name", value: "cohort_name" },
    rowId: "cohort_id",
    showDrillDown: false,
    indexTableName: "cohorts",
    group: {
      name: "Source",
      value: "source",
      type: "group",
      children: [
        {
          name: "# Persons",
          link: true,
          value: "cohort_subjects",
          processingFunction: helpers.formatComma,
        },
      ],
    },
  },
  [COST_DOMAIN_SUMMARY]: {
    rowHeader: { name: "Concept Name", value: "CONCEPT_NAME" },
    rowId: "CONCEPT_ID",
    showDrillDown: false,
    indexTableName: "costTable",
    group: {
      name: "Source",
      value: "source",
      type: "group",
      children: [
        {
          name: "Total Cost",
          link: true,
          value: "TOTAL_COST",
          processingFunction: helpers.formatComma,
        },
      ],
    },
  },
};

const loadData = async function (cdm, release, domain) {
  await store.dispatch(FETCH_FILES, {
    files: [{ name: selectedReport.value }],
    params: { cdm, release, domain },
    duckdb_supported: selectedReport.value === COHORT_INDEX,
  });
  dataSources.value = {
    ...dataSources.value,
    [`${cdm}-${release}`]: [...store.getters.getData[selectedReport.value]],
  };
};

const fetchMultiple = async function (sources) {
  dataSources.value = {};
  newSourceForm.value = false;
  sources.forEach((source) =>
    loadData(source.source, source.release, selectedDomain.value)
  );
};

function reloadData() {
  const loadedSources = Object.keys(dataSources.value)
    .map((val) => {
      return val.split("-");
    })
    .map((arr) => ({ source: arr[0], release: arr[1] }));
  dataSources.value = {};
  fetchMultiple(loadedSources);
}

watch(selectedReport, () => {
  const { cdm, release, domain, report } = route.query;
  if (cdm || release || domain || report) {
    return;
  } else {
    if (selectedReport.value === DOMAIN_SUMMARY) {
      selectedDomain.value = domainSummary[0].value;
    }
    if (selectedReport.value === COST_DOMAIN_SUMMARY) {
      selectedDomain.value = costDomainSummary[0].value;
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
      (source) => source.cdm_source_key === sourceName
    );

    // check if exists in available sources
    if (sourceIndex !== -1) {
      const parsedReleases = parsedData[sourceName];
      const availableReleases = availableSources[sourceIndex].releases;

      parsedReleases.forEach((releaseName) => {
        const releaseIndex = availableReleases.findIndex(
          (release) => release.release_id === releaseName
        );
        if (releaseIndex !== -1) {
          const key = `${sourceIndex}-${releaseIndex}`;
          attributes[key] = { partialChecked: false, checked: true };
        }
      });

      const allReleasesChecked = availableReleases.every((release) =>
        parsedReleases.includes(release.release_id)
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
    selectedDomain.value = domainSummary[0].value;

    selectedReport.value = reports[0].value;
  }
  populateSelectedAttributesFromParams();
  const defaultSource = store.getters.getSettings.defaultSources || {};
  selectedFilterAttributes.value = {
    ...selectedFilterAttributes.value,
    ...parseSourceToSelectedAttributes(defaultSource),
  };
});

//handling horizontal scroll

const tableContainer = ref(null);
const isScrolled = ref(false);

const handleScroll = () => {
  if (tableContainer.value) {
    isScrolled.value = tableContainer.value.scrollLeft > 0;
  }
};

onMounted(() => {
  const { concept, domain } = route.query;
  if (concept && domain) {
    selectedDomain.value = domain;
    loadDrilldown({ CONCEPT_ID: concept });
  }
  if (tableContainer.value) {
    tableContainer.value.addEventListener("scroll", handleScroll);
  }
});

watch(tableContainer, () => {
  if (tableContainer.value) {
    tableContainer.value.addEventListener("scroll", handleScroll);
  }
});

watch(visible, () => {
  const { domain, concept, report } = route.query;
  if (visible.value === false)
    if (domain || concept || report) {
      router.replace({ name: route.name });
    }
});

onBeforeUnmount(() => {
  if (tableContainer.value) {
    tableContainer.value.removeEventListener("scroll", handleScroll);
  }
});
</script>

<style scoped>
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
  @apply dark:bg-surface-700 bg-surface-100;
}
</style>
