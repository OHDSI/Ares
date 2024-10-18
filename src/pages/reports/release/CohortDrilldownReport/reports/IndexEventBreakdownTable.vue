<template>
  <Panel header="Index Event Breakdown">
    <div class="p-5">
      <DataTable
        removable-sort
        size="small"
        :value="props.data"
        v-model:filters="filters"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        filterDisplay="row"
        :globalFilterFields="[
          'concept_code',
          'concept_id',
          'concept_name',
          'vocabulary_id',
          'domain_field',
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
                :value="filters.global.value"
                @update:model-value="debouncedSearch($event, 'global')"
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
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          :show-filter-menu="false"
          :show-clear-button="false"
          field="concept_id"
          header="Concept ID"
          :hidden="!selectedHeaders.includes('concept_id')"
        >
          <template #filter="{}">
            <InputText
              class="rounded-r-lg"
              :value="filters.concept_id.value"
              @update:model-value="debouncedSearch($event, 'concept_id')"
              placeholder="Search concepts"
            />
          </template>
        </Column>
        <Column
          sortable
          :show-filter-menu="false"
          :show-clear-button="false"
          field="concept_name"
          header="Concept Name"
          :hidden="!selectedHeaders.includes('concept_name')"
        >
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              :maxSelectedLabels="2"
              show-clear
              filter
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="concept_options"
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
          field="domain_field"
          header="Domain Field"
          :hidden="!selectedHeaders.includes('domain_field')"
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
          field="vocabulary_id"
          header="Vocabulary Id"
          :hidden="!selectedHeaders.includes('vocabulary_id')"
        >
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              :maxSelectedLabels="2"
              show-clear
              filter
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="vocabulary_id_options"
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
          field="subject_count"
          header="Persons"
          :hidden="!selectedHeaders.includes('subject_count')"
        >
          <template #body="slotProps">
            {{
              slotProps.data.subject_count
                ? formatComma(slotProps.data.subject_count)
                : "No data"
            }}
          </template>
        </Column>
        <Column
          sortable
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="concept_count"
          header="Records"
          :hidden="!selectedHeaders.includes('concept_count')"
        >
          <template #body="slotProps">
            {{
              slotProps.data.concept_count
                ? formatComma(slotProps.data.concept_count)
                : "No data"
            }}
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
import { computed, ref, onMounted, toRaw } from "vue";
import MultiSelect from "primevue/multiselect";
import { helpers } from "@/shared/lib/mixins";
import { FilterMatchMode } from "primevue/api";
import { mdiTable } from "@mdi/js";
import InputGroup from "primevue/inputgroup";
import InputText from "primevue/inputtext";
import InputGroupAddon from "primevue/inputgroupaddon";
import SvgIcon from "@jamescoyle/vue-icon";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";
import { useRoute } from "vue-router";
import { formatComma } from "../../../../../shared/lib/mixins/methods/formatComma";
import { debounce } from "lodash";

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  domain_field: { value: null, matchMode: FilterMatchMode.IN },
  concept_name: { value: null, matchMode: FilterMatchMode.IN },
  concept_code: { value: null, matchMode: FilterMatchMode.IN },
  vocabulary_id: { value: null, matchMode: FilterMatchMode.IN },
  concept_id: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

interface Props {
  data: [];
}

const headers = ref({
  domain_field: {
    title: "Domain Field",
    sortable: true,
    key: "domain_field",
    align: "start",
    show: true,
  },
  concept_name: {
    title: "Concept Name",
    sortable: true,
    key: "concept_name",
    align: "start",
    show: true,
  },
  vocabulary_id: {
    title: "Vocabulary Id",
    sortable: true,
    key: "vocabulary_id",
    align: "end",
    show: false,
  },
  concept_id: {
    title: "Concept ID",
    sortable: true,
    key: "concept_id",
    align: "end",
    show: true,
  },
  concept_count: {
    title: "Records",
    sortable: true,
    key: "concept_count",
    align: "end",
    show: true,
  },
  subject_count: {
    title: "Persons",
    sortable: true,
    key: "subject_count",
    align: "end",
    show: true,
  },
});

const route = useRoute();

const selectedHeaders = ref([]);

const getHeaders = computed(() => {
  return Object.values(headers.value);
});

const setDefaultSelectedHeaders = function () {
  const settings =
    store.getters.getSettings.columnSelection?.[route.name]
      ?.indexEventBreakdown || [];

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
    indexEventBreakdown: selectedHeaders.value,
  };

  store.dispatch(UPDATE_COLUMN_SELECTION, {
    [route.name]: updatedSelection,
  });
};

onMounted(() => {
  setDefaultSelectedHeaders();
});

const debouncedSearch = debounce(function (data: string, field: string): void {
  filters.value[field].value = data;
}, 300);

const props = defineProps<Props>();

const store = useStore();

const domain_options = computed(() => {
  return helpers.getValuesArray(props.data, "domain_field", true);
});

const concept_options = computed(() => {
  return helpers.getValuesArray(props.data, "concept_name", true);
});

const vocabulary_id_options = computed(() => {
  return helpers.getValuesArray(props.data, "vocabulary_id", true);
});
</script>

<style scoped>
.p-inputtext {
  width: 100%;
}
</style>
