<template>
  <Dialog
    v-if="environment.WEB_API_ENABLED === 'true' && store.getters.authenticated"
    :pt="{
      root: { class: 'w-[850px]' },
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
            <Button
              color="primary"
              style="width: 12rem"
              class="search-btn"
              @click="searchApi"
              ><span class="uppercase font-light text-white px-2"
                >Search</span
              ></Button
            >
          </div>
          <div>
            <DataTable
              scrollable
              scrollHeight="550px"
              :loading="store.getters.getApiData.loading"
              removable-sort
              size="small"
              paginator
              currentPageReportTemplate="{first} to {last} of {totalRecords}"
              paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
              :value="store.getters.getApiData.data"
              :rows="10"
              :rowsPerPageOptions="[5, 10, 20, 50]"
            >
              <template #empty>
                <div class="flex justify-center">
                  <span class="">No data available</span>
                </div>
              </template>
              <Column sortable header="Concept ID" field="CONCEPT_ID"></Column>
              <Column
                sortable
                header="Concept Name"
                field="CONCEPT_NAME"
              ></Column>
              <Column sortable header="Domain" field="DOMAIN_ID"></Column>
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
          >SAVE</Button
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
import SvgIcon from "@jamescoyle/vue-icon";

import { ref, onBeforeMount, watch, Ref, nextTick } from "vue";
import { computed } from "vue";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/processes/exploreReports/model/store/actions.type";
import getDuckDBTables from "@/shared/api/duckdb/conceptTables";
import webApiKeyMap from "@/shared/config/webApiKeyMap";
import { CONCEPT } from "@/shared/config/files";
import { mdiAlertCircleOutline } from "@mdi/js";

interface Props {
  addedConcepts: object;
  show: boolean;
  multiSelection?: boolean;
}

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
    emit("close");
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

const clearMessages = function () {
  errors.value = "";
  successMessage.value = [];
};

onBeforeMount((): void => {
  if (environment.WEB_API_ENABLED === "true" && store.getters.authenticated) {
    store.dispatch(webApiActions.FETCH_WEBAPI_INFO).then(() => {
      if (store.getters.getApiData?.error) {
        store.dispatch(ADD_ALERT, {
          message: "WebAPI server replied with status code",
          status: store.getters.getApiData.error.request.status,
        });
        return;
      }
      apiSources.value = store.getters.getApiData.apiSources.filter((source) =>
        source.daimons
          .reduce((array, current) => [...array, current.daimonType], [])
          .includes("Vocabulary")
      );
      vocabularySource.value = apiSources.value[0].sourceKey;
    });
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
  emit("close");
  if (form.value) {
    form.value.resetValidation();
  }
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem);
  });
  store.dispatch(webApiActions.RESET_API_STORAGE);
};
const searchApi = function () {
  if (!query.value.length) {
    return;
  }
  store
    .dispatch(webApiActions.FETCH_VOCABULARY_SEARCH_RESULTS, {
      search: query.value,
      source: vocabularySource.value,
    })
    .then(() => {
      if (store.getters.getApiData?.error) {
        store.dispatch(ADD_ALERT, {
          message: "WebAPI server replied with status code",
          status: store.getters.getApiData.error.request.status,
        });
      }
    });
};
const saveChanges = async (item) => {
  if (props.addedConcepts[item.CONCEPT_ID] === "Loaded") {
    errors.value = "This concept has already been loaded";
    return;
  }

  loadingItem.value = item.CONCEPT_ID;

  const domain = webApiKeyMap.domains[item.DOMAIN_ID];
  const conceptId = item.CONCEPT_ID;

  const files =
    environment.DUCKDB_ENABLED === "true"
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
</script>

<script lang="ts">
export default {
  name: "ConceptSearchForm",
};
</script>

<style scoped></style>
