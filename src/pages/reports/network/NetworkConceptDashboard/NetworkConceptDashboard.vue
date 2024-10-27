<template>
  <Panel header="Network Concept Dashboard">
    <template #icons>
      <Button @click="atClick">
        <span class="uppercase font-light text-white py-1 px-2"
          >Add concepts
        </span></Button
      >
    </template>
    <div class="table-container items-center">
      <DataTable
        removable-sort
        rowGroupMode="subheader"
        class="table self-start"
        v-model:filters="filters"
        :global-filter-fields="['CDM_NAME', 'CONCEPT_NAME', 'CONCEPT_ID']"
        v-if="concepts.length && !loading"
        size="small"
        filterDisplay="row"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="concepts"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <template #header>
          <div class="flex flex-row gap-10">
            <InputGroup unstyled>
              <InputGroupAddon>
                <i class="pi pi-search"></i>
              </InputGroupAddon>
              <InputText
                class="rounded-r-lg"
                style="width: 45rem"
                unstyled
                v-model="filters.global.value"
                placeholder="Search in Table"
              />
            </InputGroup>
            <MultiSelect
              :pt="{
                root: 'dark:bg-primary-400 bg-primary-500 text-white rounded',
                labelContainer:
                  'dark:bg-primary-400 bg-primary-500 text-white rounded',
                trigger: [
                  'flex items-center justify-center shrink-0 rounded-tr-md rounded-br-md dark:bg-primary-400 w-12',
                ],
              }"
              data-key="title"
              option-label="title"
              option-value="key"
              :options="availableHeaders"
              placeholder="Select Columns"
              v-model="selectedColumns"
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
          </div>
        </template>

        <Column
          v-if="selectedColumns.includes('CDM_NAME')"
          unstyled
          sortable
          filter-field="CDM_NAME"
          :show-filter-menu="false"
          :show-clear-button="false"
          field="CDM_NAME"
          header="Source"
        >
          <template #body="{ data }">
            {{ data.CDM_NAME }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              :maxSelectedLabels="2"
              show-clear
              filter
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="statusOptions"
              placeholder="Select Source"
              class="p-column-filter w-full"
              style="min-width: 12rem"
            ></MultiSelect>
          </template>
        </Column>
        <Column
          v-if="selectedColumns.includes('CONCEPT_NAME')"
          sortable
          header="Concept Name"
          field="CONCEPT_NAME"
        ></Column>
        <Column
          v-if="selectedColumns.includes('CONCEPT_ID')"
          sortable
          header="Concept ID"
          field="CONCEPT_ID"
        ></Column>
        <Column
          v-if="selectedColumns.includes('PEOPLE_COUNT')"
          sortable
          header="# People"
          field="PEOPLE_COUNT"
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
        >
          <template #body="slotProps">
            {{ helpers.formatComma(slotProps.data.PEOPLE_COUNT) }}
          </template>
        </Column>
        <Column
          v-if="selectedColumns.includes('PEOPLE_PERCENT')"
          sortable
          header="% People"
          field="PEOPLE_PERCENT"
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
        >
          <template #body="slotProps">
            {{ slotProps.data.PEOPLE_PERCENT }}%
          </template>
        </Column>
      </DataTable>
      <div
        v-if="!concepts.length && !loading"
        class="placeholder table-placeholder"
      >
        Add at least one concept to display the results
      </div>
      <ProgressCircle v-if="loading" />
    </div>
  </Panel>
  <ConceptSearchForm
    :added-concepts="selectedConcept"
    :success-message="successMessage"
    :errors="errors"
    @close="close"
    @inputChanged="clearMessages"
    :show="showWebApiSearchForm"
    multi-selection
    @save="save"
    @missingConceptsChanged="handleFailedLoading"
  />
</template>

<script setup lang="ts">
import { ConceptSearchForm } from "@/widgets/conceptSearchForm";
import "./index.css";

import { computed, onBeforeMount, Ref, ref } from "vue";
import { useStore } from "vuex";
import Panel from "primevue/panel";
import Button from "primevue/button";
import { helpers } from "@/shared/lib/mixins";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { webApiActions } from "@/shared/api/webAPI";
import ProgressCircle from "@/entities/ProgressCircle.vue";
import MultiSelect from "primevue/multiselect";
import { FilterMatchMode } from "primevue/api";
import { mdiTable } from "@mdi/js";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
const store = useStore();

const selectedColumns = ref([]);

const successMessage: Ref<string[]> = ref([]);
const errors: Ref<string> = ref("");
const showWebApiSearchForm = ref(false);
const selectedConcept = ref([]);

const loading = ref(false);

const concepts = ref([]);

const handleFailedLoading = function () {
  loading.value = false;
};

const statusOptions = computed(() => {
  return helpers.getValuesArray(concepts.value, "CDM_NAME", true);
});

const headers = ref({
  CDM_NAME: {
    title: "Source",
    sortable: true,
    key: "CDM_NAME",
    show: true,
    default: true,
  },
  CONCEPT_NAME: {
    title: "Concept Name",
    sortable: true,
    key: "CONCEPT_NAME",
    show: true,
    default: true,
  },
  CONCEPT_ID: {
    title: "Concept ID",
    sortable: true,
    key: "CONCEPT_ID",
    show: false,
    default: false,
  },
  PEOPLE_COUNT: {
    title: "# People",
    sortable: true,
    key: "PEOPLE_COUNT",
    show: true,
    default: true,
  },
  PEOPLE_PERCENT: {
    title: "% People",
    sortable: true,
    key: "PEOPLE_PERCENT",
    show: true,
    default: true,
  },
});
const availableHeaders = computed(() => {
  return Object.values(headers.value);
});

const save = function () {
  const newConcept = store.getters.getData?.concept;
  concepts.value = [...concepts.value, ...newConcept];
  loading.value = false;
};
function atClick() {
  showWebApiSearchForm.value = true;
}
const clearMessages = function () {
  errors.value = "";
  successMessage.value = [];
};

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  CDM_NAME: { value: null, matchMode: FilterMatchMode.IN },
});
const close = function (event) {
  if (event.loading) {
    loading.value = true;
  }
  showWebApiSearchForm.value = false;
  store.dispatch(webApiActions.RESET_API_STORAGE);
  successMessage.value = [];
};

onBeforeMount(() => {
  selectedColumns.value = Object.values(headers.value)
    .filter((col) => col.default && col.show)
    .map((col) => col.key);
});
</script>
<script lang="ts">
export default {
  name: "NetworkConceptDashboard",
};
</script>

<style scoped>
.table {
  flex-grow: 1;
}

.table-card {
  padding: 10px;
  width: 100%;
  height: 100%;
}

.table-container {
  display: flex;
  flex-grow: 1;
  justify-content: center;
  padding: 10px;
  min-height: 60vh;
}

.placeholder {
  text-align: center;
  align-self: center;
}

.table-placeholder {
  font-size: 1.5rem !important;
}
</style>
