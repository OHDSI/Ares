<template>
  <Panel header="Cohort Characterization report">
    <div class="p-5">
      <DataTable
        removable-sort
        size="small"
        :value="props.data"
        v-model:filters="filters"
        paginator
        filterDisplay="row"
        :globalFilterFields="[
          'covariate_name',
          'analysis_name',
          'temporal_choice',
          'domain_id',
        ]"
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
              v-model="selectedHeaders"
              data-key="title"
              option-label="title"
              option-value="key"
              :options="getHeaders"
              placeholder="Select Columns"
              @update:modelValue="updateSettings"
            >
              <template #dropdownicon><span></span></template>
              <template #value>
                <span class="flex flex-row w-full text-white items-center">
                  <svg-icon type="mdi" :path="mdiTable"></svg-icon>
                  <span class="uppercase text-base">Columns to display</span>
                </span>
              </template>
            </MultiSelect>
          </div>
        </template>
        <Column
          sortable
          :show-filter-menu="false"
          :show-clear-button="false"
          field="concept_id"
          header="Concept ID"
          :hidden="!selectedHeaders.includes('concept_id')"
        >
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              :maxSelectedLabels="2"
              show-clear
              filter
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="concept_id_options"
              placeholder="Filter values"
              class="p-column-filter w-full"
              style="min-width: 12rem"
            ></MultiSelect>
          </template>
        </Column>

        <Column
          sortable
          :show-filter-menu="false"
          :show-clear-button="false"
          field="covariate_name"
          header="Covariate Name"
          :hidden="!selectedHeaders.includes('covariate_name')"
        >
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              :maxSelectedLabels="2"
              show-clear
              filter
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="covariate_options"
              placeholder="Filter values"
              class="p-column-filter w-full"
              style="min-width: 12rem"
            ></MultiSelect>
          </template>
        </Column>
        <Column
          sortable
          :show-filter-menu="false"
          :show-clear-button="false"
          field="analysis_name"
          header="Analysis Name"
          :hidden="!selectedHeaders.includes('analysis_name')"
        >
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              :maxSelectedLabels="2"
              show-clear
              filter
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="analysis_options"
              placeholder="Filter values"
              class="p-column-filter w-full"
              style="min-width: 12rem"
            ></MultiSelect>
          </template>
        </Column>
        <Column
          sortable
          :show-filter-menu="false"
          :show-clear-button="false"
          field="domain_id"
          header="Domain Name"
          :hidden="!selectedHeaders.includes('domain_id')"
        >
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              :maxSelectedLabels="2"
              show-clear
              filter
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="domain_options"
              placeholder="Filter values"
              class="p-column-filter w-full"
              style="min-width: 12rem"
            ></MultiSelect>
          </template>
        </Column>
        <Column
          sortable
          :show-filter-menu="false"
          :show-clear-button="false"
          field="temporal_choice"
          header="Temporal Choices"
          :hidden="!selectedHeaders.includes('temporal_choice')"
        >
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              :maxSelectedLabels="2"
              show-clear
              filter
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="temporal_choice_options"
              placeholder="Filter values"
              class="p-column-filter w-full"
              style="min-width: 12rem"
            ></MultiSelect>
          </template>
        </Column>
        <Column
          sortable
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="mean"
          header="Mean"
          :hidden="!selectedHeaders.includes('mean')"
        >
          <template #body="slotProps">
            {{
              slotProps.data.mean
                ? `${((1 - slotProps.data.mean) * 100).toFixed(2)} %`
                : "No data"
            }}
          </template>
        </Column>
        <Column
          sortable
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="sd"
          header="Sd"
          :hidden="!selectedHeaders.includes('sd')"
        >
          <template #body="slotProps">
            {{ parseFloat(slotProps.data.sd).toFixed(2) }}
          </template>
        </Column>
      </DataTable>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useStore } from "vuex";
import { computed, ref, defineProps, onMounted } from "vue";
import MultiSelect from "primevue/multiselect";
import { helpers } from "@/shared/lib/mixins";
import { FilterMatchMode } from "primevue/api";
import { mdiTable } from "@mdi/js";
import InputGroup from "primevue/inputgroup";
import InputText from "primevue/inputtext";
import InputGroupAddon from "primevue/inputgroupaddon";
import { debounce } from "lodash";
import { useRoute, useRouter } from "vue-router";
import SvgIcon from "@jamescoyle/vue-icon";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  domain_id: { value: null, matchMode: FilterMatchMode.IN },
  covariate_name: { value: null, matchMode: FilterMatchMode.IN },
  analysis_name: { value: null, matchMode: FilterMatchMode.IN },
  temporal_choice: { value: null, matchMode: FilterMatchMode.IN },
  concept_id: { value: null, matchMode: FilterMatchMode.IN },
});

const route = useRoute();

interface Props {
  data: [];
}

const headers = ref({
  domain_id: {
    title: "Domain",
    sortable: true,
    key: "domain_id",
    align: "start",
    show: true,
  },
  covariate_name: {
    title: "Covariate Name",
    sortable: true,
    key: "covariate_name",
    align: "start",
    show: true,
  },
  analysis_name: {
    title: "Analysis Name",
    sortable: true,
    key: "analysis_name",
    align: "end",
    show: false,
  },
  temporal_choice: {
    title: "Temporal Choices",
    sortable: true,
    key: "temporal_choice",
    align: "end",
    show: true,
  },
  concept_id: {
    title: "Concept ID",
    sortable: true,
    key: "concept_id",
    align: "end",
    show: true,
  },
  mean: {
    title: "Mean",
    sortable: true,
    key: "mean",
    align: "end",
    show: true,
  },
  sd: {
    title: "Sd",
    sortable: true,
    key: "sd",
    align: "end",
    show: true,
  },
});

const selectedHeaders = ref([]);

const getHeaders = computed(() => {
  return Object.values(headers.value);
});

const setDefaultSelectedHeaders = function () {
  const settings =
    store.getters.getSettings.columnSelection?.[route.name]
      ?.cohortCharacterization || [];

  const defaultHeaders = settings.length
    ? settings.map((val) => ({ ...headers.value[val], show: true }))
    : Object.values(headers.value);
  selectedHeaders.value = defaultHeaders
    .filter((value) => value.show)
    .reduce((acc, val) => [...acc, val.key], []);
};

const updateSettings = () => {
  const currentSelection =
    store.getters.getSettings.columnSelection?.[route.name] || {};
  const updatedSelection = {
    ...currentSelection,
    cohortCharacterization: selectedHeaders.value,
  };

  store.dispatch(UPDATE_COLUMN_SELECTION, {
    [route.name]: updatedSelection,
  });
};

onMounted(() => {
  setDefaultSelectedHeaders();
});

const props = defineProps<Props>();

const store = useStore();

const domain_options = computed(() => {
  return helpers.getValuesArray(props.data, "domain_id", true);
});
const analysis_options = computed(() => {
  return helpers.getValuesArray(props.data, "analysis_name", true);
});

const covariate_options = computed(() => {
  return helpers.getValuesArray(props.data, "covariate_name", true);
});

const temporal_choice_options = computed(() => {
  return helpers.getValuesArray(props.data, "temporal_choice", true);
});

const concept_id_options = computed(() => {
  return helpers.getValuesArray(props.data, "concept_id", true);
});
</script>

<style scoped></style>
