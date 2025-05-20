<template>
  <Panel header="Cohorts Table">
    <template #icons>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiCompareHorizontal"
          :tooltip="'Compare across the network'"
          @iconClicked="compareToOtherSources"
        />
      </div>
    </template>
    <div class="p-5">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
        removable-sort
        size="small"
        :value="data"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        v-model:filters="newFilters"
        :globalFilterFields="['cohort_id', 'cohort_name', '']"
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
                :value="route.query.search"
                @update:modelValue="debouncedSearch"
                placeholder="Search in Table"
              />
            </InputGroup>
          </div>
        </template>
        <Column field="cohort_id" header="Cohort ID">
          <template #body="slotProps">
            <a class="cursor-pointer" @click="openDrilldown(slotProps.data)">{{
              slotProps.data.cohort_id
            }}</a>
          </template>
        </Column>
        <Column field="cohort_name" header="Cohort Name">
          <template #body="slotProps">
            <a class="cursor-pointer" @click="openDrilldown(slotProps.data)">{{
              slotProps.data.cohort_name
            }}</a>
          </template>
        </Column>
        <Column
          sortable
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="cohort_subjects"
          header="# People"
        >
          <template #body="slotProps">
            {{
              parseFloat(slotProps.data.cohort_subjects) &&
              !isNaN(parseFloat(slotProps.data.cohort_subjects))
                ? formatComma(slotProps.data.cohort_subjects)
                : "No data"
            }}
          </template>
        </Column>
      </DataTable>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { debounce } from "lodash";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import { FilterMatchMode } from "primevue/api";
import { COHORT_INDEX } from "@/shared/config/files";
import { formatComma } from "@/shared/lib/mixins/methods/formatComma";
import { mdiCompareHorizontal } from "@mdi/js";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

const newFilters = computed(() => ({
  global: { value: route.query.search, matchMode: FilterMatchMode.CONTAINS },
}));

const compareToOtherSources = function () {
  const source = route.params.cdm;
  const domain = route.params.domain;
  const release = route.params.release;
  router.push({
    name: "networkComparisonTool",
    params: {
      cdm: source,
      domain: domain,
      release: release,
      report: "cohort",
    },
  });
};

const debouncedSearch = debounce(function (data: string): void {
  router.push({
    query: {
      search: data,
    },
  });
}, 300);

const data = ref(null);

onMounted(() => {
  data.value = store.getters.getData[COHORT_INDEX];
});

const emit = defineEmits(["openDrilldown"]);

function openDrilldown(item) {
  emit("openDrilldown", item);
}
</script>

<style scoped>
.p-inputtext {
  width: 200%;
}
</style>
