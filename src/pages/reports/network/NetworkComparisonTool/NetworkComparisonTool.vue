<template>
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
        <Dropdown
          option-label="name"
          option-value="value"
          v-model="selectedReport"
          :options="reports"
          placeholder="Select report"
        ></Dropdown>
        <Dropdown
          v-if="selectedReport === DOMAIN_SUMMARY"
          placeholder="Select domain"
          option-label="name"
          option-value="value"
          v-model="selectedDomain"
          :options="domains"
        ></Dropdown>
        <Button
          :pt="{
            root: 'dark:bg-primary-400 bg-primary-500 text-white rounded',
            labelContainer:
              'dark:bg-primary-400 bg-primary-500 text-white rounded',
            trigger: [
              'flex items-center justify-center shrink-0 rounded-tr-md rounded-br-md dark:bg-primary-400 w-12',
            ],
          }"
          class="px-2"
          @click="newSourceForm = true"
          >DATA SOURCES</Button
        >
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
                  v-for="source in sources"
                  :colspan="selectedConfig.group.children.length"
                  :key="source"
                >
                  {{ source }}
                </th>
              </tr>
              <tr>
                <template v-for="source in sources" :key="source">
                  <th
                    v-for="child in selectedConfig.group.children"
                    :key="child.name"
                  >
                    {{ child.name }}
                  </th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rowName in slicedArray" :key="rowName">
                <td :class="{ scrolled: isScrolled }" class="rowNameCol">
                  {{ rowName }}
                </td>
                <template v-for="source in sources" :key="source">
                  <td
                    v-for="child in selectedConfig.group.children"
                    :key="child.value"
                  >
                    {{
                      getSourceData(source, rowName)[child.value]
                        ? child.processingFunction
                          ? child.processingFunction(
                              getSourceData(source, rowName)[child.value]
                            )
                          : getSourceData(source, rowName)[child.value]
                        : "N/A"
                    }}
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

    <Dialog
      style="width: 600px"
      show-header
      header="DATA SOURCES"
      v-model:visible="newSourceForm"
    >
      <div class="px-5 py-3 flex flex-col gap-5">
        <div class="flex flex-col gap-4">
          SELECTED DATA SOURCES
          <ul
            class="flex flex-row gap-2 w-full rounded border-surface-700 border-solid flex-wrap"
          >
            <li
              v-for="source in loadList"
              :key="`${source.source}${source.release}`"
            >
              <Chip
                @remove="
                  () =>
                    removeSource({
                      source: source.source,
                      release: source.release,
                    })
                "
                removable
                >{{ source.source }} {{ source.release }}</Chip
              >
            </li>
          </ul>
        </div>
        <div class="flex flex-col gap-5">
          ADD A DATA SOURCE
          <Dropdown
            option-value="cdm_source_key"
            option-label="cdm_source_key"
            placeholder="Select Data Source"
            :options="availableSources"
            v-model="selectedSource.source"
            class="w-full"
          ></Dropdown>
          <Dropdown
            option-label="release_name"
            option-value="release_id"
            placeholder="Select Release"
            :options="availableReleases"
            v-model="selectedSource.release"
            class="w-full"
          ></Dropdown>
        </div>
      </div>
      <div class="px-5 py-3 pt-5 flex flex-row justify-end">
        <Button text @click="addToLoadList"
          >ADD TO SELECTED DATA SOURCES</Button
        >
      </div>
      <div class="px-5 py-3 pt-5 flex flex-row justify-center">
        <Button text @click="() => fetchMultiple(loadList)"
          >LOAD SELECTED</Button
        >
      </div>
    </Dialog>
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import Paginator from "primevue/paginator";
import Dropdown from "primevue/dropdown";
import Dialog from "primevue/dialog";
import { useStore } from "vuex";
import { FETCH_FILES } from "@/processes/exploreReports/model/store/actions.type";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { COHORT_INDEX, DOMAIN_SUMMARY } from "@/shared/config/files";
import Button from "primevue/button";
import { helpers } from "@/shared/lib/mixins";
import InputText from "primevue/inputtext";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import Chip from "primevue/chip";
import { useRoute } from "vue-router";

const route = useRoute();
const store = useStore();

const first = ref(0);
const search = ref(null);
const step = ref(10);

const selectedConfig = computed(() => {
  return reportColumnNames[selectedReport.value];
});

const availableSources = store.getters.getSources;
const dataSources = ref({});
const getSourceData = (source, rowName) => {
  return (
    dataSources.value[source].find(
      (item) => item[selectedConfig.value.rowHeader.value] === rowName
    ) || {}
  );
};
const sources = computed(() => Object.keys(dataSources.value));

const rowNames = computed(() => [
  ...new Set(
    Object.values(dataSources.value)
      .flat()
      .map((item) => item[selectedConfig.value.rowHeader.value])
  ),
]);

const filteredResults = computed(() => {
  if (search.value && search.value.length) {
    return rowNames.value.filter((val) =>
      val.toLowerCase().includes(search.value.toLowerCase())
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

const loadList = ref([]);

function removeSource(e) {
  loadList.value = loadList.value.filter((val) => {
    return val.source !== e.source || val.release !== e.release;
  });
}

const selectedSource = ref({ source: null, release: null });

const selectedDomain = ref(null);

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
];

const domains = [
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

const reportColumnNames = {
  [DOMAIN_SUMMARY]: {
    rowHeader: { name: "Concept Name", value: "CONCEPT_NAME" },
    group: {
      name: "Source",
      value: "source",
      children: [
        {
          name: "# Persons",
          value: "NUM_PERSONS",
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
    group: {
      name: "Source",
      value: "source",
      type: "group",
      children: [
        {
          name: "# Persons",
          value: "cohort_subjects",
          processingFunction: helpers.formatComma,
        },
      ],
    },
  },
};
const availableReleases = computed(() => {
  const sourceReleases =
    availableSources.find(
      (val) => val.cdm_source_key === selectedSource.value.source
    )?.releases || [];
  return sourceReleases.filter((release) => {
    return !loadList.value
      .filter((s) => s.source === selectedSource.value.source)
      .map((loadedRelease) => loadedRelease.release)
      .includes(release.release_id);
  });
});

const addToLoadList = function () {
  if (selectedSource.value.source && selectedSource.value.release) {
    loadList.value.push(selectedSource.value);
    selectedSource.value = { source: null, release: null };
  }
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

watch(
  () => selectedSource.value.source,
  () => {
    selectedSource.value.release = availableReleases.value?.[0]?.release_id;
  }
);

watch(selectedReport, () => {
  if (selectedReport.value === DOMAIN_SUMMARY) {
    selectedDomain.value = domains[0].value;
  }
  reloadData();
});
watch(selectedDomain, () => {
  reloadData();
});
onMounted(() => {
  const source = route.params.cdm;
  const domain = route.params.domain;
  const release = route.params.release;
  if (source && domain && release) {
    loadList.value.push({ source, release, domain });
    selectedDomain.value = domain;
    selectedReport.value = DOMAIN_SUMMARY;
    fetchMultiple(loadList.value);
  } else if (source && release) {
    loadList.value.push({ source, release });
    selectedReport.value = COHORT_INDEX;
    fetchMultiple(loadList.value);
  } else {
    selectedDomain.value = domains[0].value;
    selectedReport.value = reports[0].value;
  }
});

//handling scroll

const tableContainer = ref(null);
const isScrolled = ref(false);

const handleScroll = () => {
  if (tableContainer.value) {
    isScrolled.value = tableContainer.value.scrollLeft > 0;
  }
};

onMounted(() => {
  if (tableContainer.value) {
    tableContainer.value.addEventListener("scroll", handleScroll);
  }
});

watch(tableContainer, () => {
  if (tableContainer.value) {
    tableContainer.value.addEventListener("scroll", handleScroll);
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
  text-align: center;
}

th,
tr {
  @apply border-b dark:border-surface-700 border-surface-200;
}

.rowNameCol.scrolled {
  @apply dark:bg-surface-700 bg-surface-100;
}

td {
  border: none;
}
</style>
