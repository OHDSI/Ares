<template>
  <Dialog
    v-if="webapiEnabled && authenticated"
    :pt="{
      root: { class: 'min-w-[1000px] max-w-[1500px]' },
    }"
    header="Vocabulary Search"
    unstyled
    modal
    v-model:visible="displayForm"
  >
    <div class="h-full relative">
      <div class="p-6">
        <div class="flex flex-col gap-10 p-3">
          <div class="flex flex-row gap-5">
            <InputText
              class="flex-grow"
              v-model="query"
              title="Search concepts"
              label="Search concepts"
              placeholder="Your query"
              @keyup.enter="searchApi"
            ></InputText>
            <Dropdown
              v-model="vocabularySource"
              :options="apiSources"
              option-label="sourceKey"
              option-value="sourceKey"
              placeholder="Vocabulary source"
            >
            </Dropdown>
            <MultiSelect
              :maxSelectedLabels="2"
              :loading="vocabNamesLoading"
              v-model="selectedVocabs"
              :options="availableVocabs"
              option-label="VOCABULARY_ID"
              option-value="VOCABULARY_ID"
              placeholder="Vocabularies"
            >
            </MultiSelect>
            <MultiSelect
              :pt="{
                root: 'dark:bg-primary-400 bg-primary-500 text-white rounded',
                labelContainer:
                  'dark:bg-primary-400 bg-primary-500 text-white rounded',
                trigger: [
                  'flex items-center justify-center shrink-0 rounded-tr-md rounded-br-md dark:bg-primary-400 w-12',
                ],
              }"
              v-model="selectedHeaders"
              data-key="title"
              option-label="title"
              option-value="key"
              :options="getHeaders"
              placeholder="Select Columns"
            >
              <template #value>
                <span class="flex flex-row w-full text-white items-center">
                  <svg-icon type="mdi" :path="mdiTable"></svg-icon>
                  <span class="uppercase text-base">Columns to display</span>
                </span>
              </template>
              <template #dropdownicon>
                <span></span>
              </template>
            </MultiSelect>

            <Button color="primary" class="search-btn" @click="searchApi"
              ><span class="uppercase font-light text-white px-2"
                >Search</span
              ></Button
            >
          </div>
          <div>
            <DataTable
              filterDisplay="row"
              v-model:filters="newFilters"
              :striped-rows="store.getters.getSettings.strippedRows"
              scrollable
              scrollHeight="550px"
              :loading="store.getters.getApiData.loading"
              removable-sort
              size="small"
              paginator
              currentPageReportTemplate="{first} to {last} of {totalRecords}"
              paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
              :value="searchData"
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20, 50]"
            >
              <template #empty>
                <div class="flex justify-center">
                  <span class="">No data available</span>
                </div>
              </template>
              <Column
                :hidden="!selectedHeaders.includes('CONCEPT_ID')"
                sortable
                header="Concept ID"
                field="CONCEPT_ID"
              ></Column>
              <Column
                :hidden="!selectedHeaders.includes('CONCEPT_NAME')"
                sortable
                header="Concept Name"
                field="CONCEPT_NAME"
              ></Column>
              <Column
                :hidden="!selectedHeaders.includes('CONCEPT_CLASS_ID')"
                sortable
                header="Class"
                field="CONCEPT_CLASS_ID"
                filter-field="CONCEPT_CLASS_ID"
                :show-filter-menu="false"
                :show-clear-button="false"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    :maxSelectedLabels="2"
                    filter
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    placeholder="Concept Class"
                    :options="concept_class_options"
                    class="p-column-filter w-full"
                  >
                    <template #option="slotProps">
                      {{ slotProps.option }}
                    </template>
                  </MultiSelect>
                </template>
              </Column>
              <Column
                :show-filter-menu="false"
                :show-clear-button="false"
                :hidden="!selectedHeaders.includes('STANDARD_CONCEPT_CAPTION')"
                sortable
                header="Standard Concept"
                field="STANDARD_CONCEPT_CAPTION"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    :maxSelectedLabels="2"
                    filter
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="standard_concept_options"
                    placeholder="Standard concept"
                    class="p-column-filter w-full"
                  >
                    <template #option="slotProps">
                      {{ slotProps.option }}
                    </template>
                  </MultiSelect>
                </template>
              </Column>
              <Column
                :show-filter-menu="false"
                :show-clear-button="false"
                :hidden="!selectedHeaders.includes('VOCABULARY_ID')"
                sortable
                header="Vocabulary"
                field="VOCABULARY_ID"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    :maxSelectedLabels="2"
                    filter
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="vocabulary_options"
                    placeholder="Vocabularies"
                    class="p-column-filter w-full"
                  >
                    <template #option="slotProps">
                      {{ slotProps.option }}
                    </template>
                  </MultiSelect>
                </template>
              </Column>
              <Column
                :show-filter-menu="false"
                :show-clear-button="false"
                :hidden="!selectedHeaders.includes('INVALID_REASON_CAPTION')"
                sortable
                header="Invalid Reason"
                field="INVALID_REASON_CAPTION"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    :maxSelectedLabels="2"
                    filter
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    placeholder="Reasons"
                    :options="invalid_reason_options"
                    class="p-column-filter w-full"
                  >
                    <template #option="slotProps">
                      {{ slotProps.option }}
                    </template>
                  </MultiSelect>
                </template>
              </Column>
              <Column
                :show-filter-menu="false"
                :show-clear-button="false"
                :hidden="!selectedHeaders.includes('DOMAIN_ID')"
                sortable
                header="Domain"
                field="DOMAIN_ID"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    :maxSelectedLabels="2"
                    filter
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="domain_options"
                    placeholder="Domains"
                    class="p-column-filter w-full"
                  >
                    <template #option="slotProps">
                      {{ slotProps.option }}
                    </template>
                  </MultiSelect>
                </template>
              </Column>
              <Column
                :pt="{ headerContent: 'justify-end' }"
                :hidden="!selectedHeaders.includes('record_count')"
                sortable
                header="RC"
                field="record_count"
              >
                <template #body="slotProps">
                  <div class="flex justify-end">
                    {{ helpers.formatComma(slotProps.data.record_count) }}
                  </div>
                </template>
              </Column>
              <Column
                :pt="{ headerContent: 'justify-end' }"
                :hidden="!selectedHeaders.includes('desc_record_count')"
                sortable
                header="DRC"
                field="desc_record_count"
              >
                <template #body="slotProps">
                  <div class="flex justify-end">
                    {{ helpers.formatComma(slotProps.data.desc_record_count) }}
                  </div>
                </template>
              </Column>
              <Column
                :pt="{ headerContent: 'justify-end' }"
                :hidden="!selectedHeaders.includes('person_count')"
                sortable
                header="PC"
                field="person_count"
              >
                <template #body="slotProps">
                  <div class="flex justify-end">
                    {{ helpers.formatComma(slotProps.data.person_count) }}
                  </div>
                </template>
              </Column>
              <Column
                :pt="{ headerContent: 'justify-end' }"
                :hidden="!selectedHeaders.includes('desc_person_count')"
                sortable
                header="DPC"
                field="desc_person_count"
              >
                <template #body="slotProps">
                  <div class="flex justify-end">
                    {{ helpers.formatComma(slotProps.data.desc_person_count) }}
                  </div>
                </template>
              </Column>
              <Column
                style="text-align: center"
                :pt="{ headerContent: 'justify-center' }"
                header=""
              >
                <template #header>
                  <div
                    class="flex items-center content-center align-middle gap-1"
                  >
                    <span>Status</span>
                    <i
                      class="pi pi-question-circle"
                      v-tooltip.top="{
                        value: tooltipValue,
                        escape: false,
                        pt: {
                          root: 'absolute',
                          arrow: {
                            style: {
                              borderRightColor: 'var(--primary-color)',
                            },
                          },
                          text: 'border rounded bg-surface-800 dark:bg-surface-50 text-white dark:text-black font-light p-2 break-words text-wrap max-w-[20ch]',
                        },
                      }"
                    ></i>
                  </div>
                </template>
                <template #body="slotProps">
                  <Button
                    text
                    v-if="
                      !loadedConcepts[slotProps.data.CONCEPT_ID] &&
                      !missingConcepts[slotProps.data.CONCEPT_ID] &&
                      loadingItem !== slotProps.data.CONCEPT_ID
                    "
                    icon="pi pi-plus"
                    outlined
                    rounded
                    @click="saveChanges(slotProps.data)"
                  />
                  <Button
                    disabled
                    text
                    v-if="missingConcepts[slotProps.data.CONCEPT_ID]"
                    icon="pi pi-times"
                    outlined
                    rounded
                    severity="danger"
                  />
                  <Button
                    disabled
                    text
                    v-if="loadingItem === slotProps.data.CONCEPT_ID"
                    icon="pi pi-spin pi-spinner"
                    outlined
                    rounded
                    severity="info"
                  />
                  <Button
                    disabled
                    text
                    v-if="
                      loadedConcepts[slotProps.data.CONCEPT_ID] === 'Loaded'
                    "
                    icon="pi pi-check"
                    outlined
                    rounded
                    severity="success"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 right-0">
        <Button text severity="danger" size="large" @click="close"
          >CLOSE</Button
        >
      </div>
    </div>
  </Dialog>
  <Dialog
    v-else
    :pt="{
      root: { class: 'w-[400px]' },
    }"
    modal
    v-model:visible="displayForm"
    header="New Concept"
  >
    <div class="p-3">
      <div class="flex flex-col gap-5">
        <InputText
          v-model.number="editedItem.CONCEPT_ID"
          :rules="[rules.required, rules.concept]"
          prepend-icon="mdi-chart-timeline-variant-shimmer"
          label="Concept ID"
          density="compact"
          variant="outlined"
          :success-messages="successMessage"
          :error-messages="errors"
        >
        </InputText>
        <Dropdown
          v-model="editedItem.DOMAIN_ID"
          :rules="[rules.required]"
          label="Domain"
          option-label="title"
          prepend-icon="mdi-folder"
          density="compact"
          variant="outlined"
          option-value="key"
          :options="domains"
        >
        </Dropdown>
      </div>
      <div class="flex flex-row justify-between relative bottom-0">
        <Button text severity="danger" size="large" @click="displayForm = false"
          >CANCEL</Button
        >
        <Button
          text
          severity="info"
          size="large"
          @click="saveChanges(editedItem)"
          >LOAD</Button
        >
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { webApiActions } from "@/shared/api/webAPI";
import { ADD_ALERT } from "@/widgets/snackbar/model/store/actions.type";
import { useStore } from "vuex";
import environment from "@/shared/api/environment";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { toRaw } from "vue";
import MultiSelect from "primevue/multiselect";
import SvgIcon from "@jamescoyle/vue-icon";

import { ref, onBeforeMount, watch, Ref, nextTick } from "vue";
import { computed } from "vue";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import {
  FETCH_MULTIPLE_FILES_BY_SOURCE,
  RESET_DATA_STORAGE,
} from "@/processes/exploreReports/model/store/actions.type";
import getDuckDBTables from "@/shared/api/duckdb/conceptTables";
import webApiKeyMap from "@/shared/config/webApiKeyMap";
import { CONCEPT } from "@/shared/config/files";
import { mdiAlertCircleOutline, mdiTable } from "@mdi/js";
import errorMessages from "@/widgets/error/model/config/errorMessages";
import {
  FETCH_CONCEPTS_RECORD_COUNT,
  FETCH_VOCABULARIES,
} from "@/shared/api/webAPI/data/store/actions.type";
import { FilterMatchMode } from "primevue/api";
import { helpers } from "@/shared/lib/mixins";

interface Props {
  addedConcepts: object;
  show: boolean;
  multiSelection?: boolean;
}

const newFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  CONCEPT_CLASS_ID: { value: null, matchMode: FilterMatchMode.IN },
  STANDARD_CONCEPT_CAPTION: {
    value: null,
    matchMode: FilterMatchMode.IN,
  },
  VOCABULARY_ID: { value: null, matchMode: FilterMatchMode.IN },
  INVALID_REASON_CAPTION: { value: null, matchMode: FilterMatchMode.IN },
  DOMAIN_ID: { value: null, matchMode: FilterMatchMode.IN },
});

const concept_class_options = computed(() => {
  return helpers.getValuesArray(searchData.value, "CONCEPT_CLASS_ID", true);
});

const standard_concept_options = computed(() => {
  return helpers.getValuesArray(
    searchData.value,
    "STANDARD_CONCEPT_CAPTION",
    true
  );
});

const vocabulary_options = computed(() => {
  return helpers.getValuesArray(searchData.value, "VOCABULARY_ID", true);
});

const invalid_reason_options = computed(() => {
  return helpers.getValuesArray(
    searchData.value,
    "INVALID_REASON_CAPTION",
    true
  );
});

const domain_options = computed(() => {
  return helpers.getValuesArray(searchData.value, "DOMAIN_ID", true);
});

const headers = ref({
  CONCEPT_ID: {
    title: "Concept Id",
    key: "CONCEPT_ID",
    show: true,
  },
  CONCEPT_NAME: {
    title: "Concept Name",
    key: "CONCEPT_NAME",
    show: true,
  },
  CONCEPT_CLASS_ID: {
    title: "Class",
    key: "CONCEPT_CLASS_ID",
    show: false,
  },
  STANDARD_CONCEPT_CAPTION: {
    title: "Standard Concept",
    key: "STANDARD_CONCEPT_CAPTION",
    show: true,
  },
  VOCABULARY_ID: {
    title: "Vocabulary",
    key: "VOCABULARY_ID",
    show: false,
  },
  INVALID_REASON_CAPTION: {
    title: "Invalid Reason",
    key: "INVALID_REASON_CAPTION",
    show: false,
  },
  DOMAIN_ID: {
    title: "Domain",
    key: "DOMAIN_ID",
    show: false,
  },

  record_count: {
    title: "Record count",
    key: "record_count",
    show: true,
  },
  desc_record_count: {
    title: "Descendant record count",
    key: "desc_record_count",
    show: true,
  },
  person_count: {
    title: "Person count",
    key: "person_count",
    show: true,
  },
  desc_person_count: {
    title: "Descendant person count",
    key: "desc_person_count",
    show: true,
  },
});

const selectedHeaders = ref([]);

const getHeaders = computed(() => {
  return Object.values(headers.value);
});

const tooltipValue =
  "<div><i class='pi pi-plus text-primary-500'></i> - <span>Add concept</span></div> " +
  "<div><i class='pi pi-spin pi-spinner'></i> - <span>Concept is loading</span></div> " +
  "<div><i class='pi pi-times text-red-500 '></i> - <span>Concept N/A</span></div> " +
  "<div><i class='pi pi-check  text-green-500'></i> - <span>Concept is loaded</span></div>";

const displayForm = computed({
  get: function () {
    return props.show;
  },
  set: function () {
    emit("close", { loading: false });
  },
});

const domains: Ref<DataTableHeader[]> = ref([
  { title: "Condition occurrence", key: "Condition" },
  { title: "Drug Exposure", key: "Drug" },
  { title: "Device Exposure", key: "Device" },
  { title: "Measurement", key: "Measurement" },
  { title: "Procedure Occurrence", key: "Procedure" },
  { title: "Observation", key: "Observation" },
]);

const loadedConcepts = ref({});
const form: Ref<HTMLFormElement> = ref(null);
const props = defineProps<Props>();
const store = useStore();
const emit = defineEmits([
  "inputChanged",
  "save",
  "close",
  "missingConceptsChanged",
]);
const errors = ref("");
const successMessage = ref([]);
const query: Ref<string> = ref("");
const missingConcepts = ref([]);
const vocabularySource: Ref<string> = ref("");
const editedItem = ref({
  CONCEPT_ID: "",
  DOMAIN_ID: "",
});

const loadingItem = ref("");
const defaultItem = {
  CONCEPT_ID: "",
  DOMAIN_ID: "",
};

const searchData: Ref<any[]> = ref([]);
// const searchData = computed(() => {
//   return store.getters.getApiData.data;
// });

const selectedVocabs = ref([]);

const availableVocabs = ref([]);

const clearMessages = function () {
  errors.value = "";
  successMessage.value = [];
};

const authenticated = computed(() => {
  return store.getters.authenticated;
});

const webapiEnabled = environment.WEB_API_ENABLED;

// Fetching data
async function fetchVocabularies() {
  return store.dispatch(webApiActions.FETCH_WEBAPI_INFO).then(() => {
    const error = store.getters.getApiData?.error;
    if (error) {
      store.dispatch(ADD_ALERT, {
        message: `WebAPI server replied with status code ${error.response.status}`,
        status: errorMessages.webApiErrors[error.response.status],
      });
      return;
    }
    apiSources.value = store.getters.getApiData.apiSources;
    apiSources.value = apiSources.value.sort((a, b) => {
      const aPriority =
        a.daimons.find((d) => d.daimonType === "Vocabulary")?.priority ?? -1;
      const bPriority =
        b.daimons.find((d) => d.daimonType === "Vocabulary")?.priority ?? -1;
      return bPriority - aPriority;
    });
    console.log(apiSources.value);
    vocabularySource.value = apiSources.value[0].sourceKey;
  });
}

const vocabNamesLoading = ref(false);

async function fetchVocabularyNames() {
  vocabNamesLoading.value = true;
  try {
    store
      .dispatch(FETCH_VOCABULARIES, {
        source: vocabularySource.value,
      })
      .then((res) => (availableVocabs.value = res.data));
  } catch (error) {
    console.error("Failed to fetch vocabulary names:", error);
  } finally {
    vocabNamesLoading.value = false;
  }
}

const searchApi = async function () {
  if (!query.value.length) {
    return;
  }
  store
    .dispatch(webApiActions.FETCH_VOCABULARY_SEARCH_RESULTS, {
      search: query.value,
      source: vocabularySource.value,
      vocab_id: selectedVocabs.value || [],
    })
    .then(() => {
      const error = store.getters.getApiData?.error;
      if (error) {
        store.dispatch(ADD_ALERT, {
          message: `WebAPI server replied with status code ${error.response.status}`,
          status: errorMessages.webApiErrors[error.response.status],
        });
      } else {
        const data = store.getters.getApiData.data;
        let recordCount;
        store
          .dispatch(FETCH_CONCEPTS_RECORD_COUNT, {
            conceptsList: helpers.getValuesArray(data, "CONCEPT_ID", true),
          })
          .then((response) => {
            recordCount = response.data;
            const flattenedRecordCount = recordCount.reduce(
              (acc, obj) => ({ ...acc, ...obj }),
              {}
            );
            searchData.value = data.map((val) => {
              const concept = flattenedRecordCount[val.CONCEPT_ID];
              const [
                record_count,
                desc_record_count,
                person_count,
                desc_person_count,
              ] = concept;
              return {
                ...val,
                record_count,
                desc_record_count,
                person_count,
                desc_person_count,
              };
            });
          });
      }
    });
};
const saveChanges = async (item) => {
  if (props.addedConcepts[item.CONCEPT_ID] === "Loaded") {
    errors.value = "This concept has already been loaded";
    return;
  }
  if (!webapiEnabled || !authenticated.value) {
    emit("close", { loading: true });
  }

  loadingItem.value = item.CONCEPT_ID;

  const domain = webApiKeyMap.domains[item.DOMAIN_ID];
  const conceptId = item.CONCEPT_ID;

  const files = environment.DUCKDB_ENABLED
    ? getDuckDBTables({ domain, concept: conceptId })[domain]
    : [
        {
          name: CONCEPT,
          instanceParams: [{ domain, concept: conceptId }],
        },
      ];

  await store.dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
    files,
    criticalError: false,
    duckdb_supported: true,
    skipLoading: true,
  });

  loadingItem.value = "";

  const conceptData = toRaw(store.getters.getData.concept) || {};

  if (!Object.keys(conceptData).length) {
    errors.value = "Requested concept is not found across data sources";
    missingConcepts.value = { ...missingConcepts.value, [conceptId]: true };
    if (!props.multiSelection) {
      loadedConcepts.value = {};
    }
  } else {
    loadedConcepts.value = props.multiSelection
      ? { ...loadedConcepts.value, [conceptId]: "Loaded" }
      : { [conceptId]: "Loaded" };
    successMessage.value = ["Concept loaded"];
  }
};

onBeforeMount((): void => {
  if (webapiEnabled && authenticated.value) {
    fetchVocabularies().then(() => fetchVocabularyNames());
    // fetchVocabularyNames();
  }
  selectedHeaders.value = Object.values(headers.value)
    .filter((val) => val.show)
    .map((val) => val.key);
});

watch(authenticated, () => {
  if (authenticated.value) {
    fetchVocabularies().then(() => fetchVocabularyNames());
  }
});

watch(vocabularySource, () => {
  if (vocabularySource.value) {
    fetchVocabularyNames();
  }
});

watch(editedItem, (): void => {
  emit("inputChanged", editedItem);
});
watch(loadedConcepts, (): void => {
  emit("save", loadedConcepts.value);
});

watch(missingConcepts, (): void => {
  emit("missingConceptsChanged", Object.keys(missingConcepts.value).length);
});

const rules = {
  required: (value) => !!value || "Required field",
  concept: (value) => {
    const pattern = /^\d+$/;
    return pattern.test(value) || "The field is digits only";
  },
};
const apiSources = ref([]);

const close = function (): void {
  emit("close", { loading: false });
  if (form.value) {
    form.value.resetValidation();
  }
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem);
  });
  store.dispatch(webApiActions.RESET_API_STORAGE);
};
</script>

<script lang="ts">
export default {
  name: "ConceptSearchForm",
};
</script>

<style scoped></style>
