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
          >ADD SOURCE</Button
        >
      </div>
      <div class="flex flex-col gap-5" v-if="Object.keys(dataSources).length">
        <div ref="tableContainer" class="overflow-x-scroll table-container">
          <table>
            <thead>
              <tr>
                <th
                  class="conceptCol"
                  :class="{ scrolled: isScrolled }"
                  rowspan="2"
                >
                  Concept Name
                </th>
                <th v-for="source in sources" :colspan="2" :key="source">
                  {{ source }}
                </th>
              </tr>
              <tr>
                <template v-for="source in sources" :key="source">
                  <th># Persons</th>
                  <th>% Persons</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="concept in slicedArray" :key="concept">
                <td :class="{ scrolled: isScrolled }" class="conceptCol">
                  {{ concept }}
                </td>
                <template v-for="source in sources">
                  <td>
                    {{
                      getSourceData(source, concept).NUM_PERSONS
                        ? helpers.formatComma(
                            getSourceData(source, concept).NUM_PERSONS
                          )
                        : "N/A"
                    }}
                  </td>
                  <td>
                    {{
                      getSourceData(source, concept).PERCENT_PERSONS
                        ? helpers.formatPercent(
                            getSourceData(source, concept).PERCENT_PERSONS
                          )
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
      header="NEW SOURCE"
      v-model:visible="newSourceForm"
    >
      <div class="px-5 py-3 flex flex-col gap-5">
        <div class="flex flex-col gap-4">
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
          <Dropdown
            option-value="cdm_source_key"
            option-label="cdm_source_key"
            placeholder="Select source"
            :options="availableSources"
            v-model="selectedSource.source"
            class="w-full"
          ></Dropdown>
          <Dropdown
            option-label="release_name"
            option-value="release_id"
            placeholder="Select release"
            :options="availableReleases"
            v-model="selectedSource.release"
            class="w-full"
          ></Dropdown>
        </div>
      </div>
      <div class="px-5 py-3 pt-5 flex flex-row justify-between">
        <Button text @click="addToLoadList">Add to list</Button>
        <Button text @click="() => fetchMultiple(loadList)"
          >Load selected</Button
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
import { DOMAIN_SUMMARY } from "@/shared/config/files";
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

const availableSources = store.getters.getSources;
const dataSources = ref({});
const getSourceData = (source, concept) => {
  return (
    dataSources.value[source].find((item) => item.CONCEPT_NAME === concept) ||
    {}
  );
};
const sources = computed(() => Object.keys(dataSources.value));

const conceptNames = computed(() => [
  ...new Set(
    Object.values(dataSources.value)
      .flat()
      .map((item) => item.CONCEPT_NAME)
  ),
]);

const filteredResults = computed(() => {
  if (search.value && search.value.length) {
    return conceptNames.value.filter((val) =>
      val.toLowerCase().includes(search.value.toLowerCase())
    );
  } else {
    return conceptNames.value;
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

const newSourceForm = ref(false);

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
    files: [{ name: DOMAIN_SUMMARY }],
    params: { cdm, release, domain },
  });
  dataSources.value = {
    ...dataSources.value,
    [`${cdm}-${release}`]: [...store.getters.getData[DOMAIN_SUMMARY]],
  };
};

const fetchMultiple = async function (sources) {
  dataSources.value = {};
  newSourceForm.value = false;
  sources.forEach((source) =>
    loadData(source.source, source.release, selectedDomain.value)
  );
};

watch(selectedDomain, () => {
  const loadedSources = Object.keys(dataSources.value)
    .map((val) => {
      return val.split("-");
    })
    .map((arr) => ({ source: arr[0], release: arr[1] }));
  dataSources.value = {};
  fetchMultiple(loadedSources);
});

watch(
  () => selectedSource.value.source,
  () => {
    selectedSource.value.release = availableReleases.value?.[0]?.release_id;
  }
);
onMounted(() => {
  const source = route.params.cdm;
  const domain = route.params.domain;
  const release = route.params.release;
  if (source && domain && release) {
    loadList.value.push({ source, release, domain });
    selectedDomain.value = domain;
    fetchMultiple(loadList.value);
  } else {
    selectedDomain.value = domains[0].value;
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
.conceptCol {
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

.conceptCol.scrolled {
  @apply dark:bg-surface-700 bg-surface-100;
}

td {
  border: none;
}
</style>
