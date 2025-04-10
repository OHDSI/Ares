<template>
  <Panel header="Cost Table">
    <div class="p-5">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
        removable-sort
        size="small"
        :value="table"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        v-model:filters="newFilters"
        :globalFilterFields="['CONCEPT_ID', 'CONCEPT_NAME', '']"
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
        <Column field="CONCEPT_ID" header="Concept ID">
          <template #body="slotProps">
            <router-link
              class="text-blue-400 hover:underline"
              :to="getReportRoute(slotProps.data)"
              :title="slotProps.data.CONCEPT_ID"
              >{{ slotProps.data.CONCEPT_ID }}
            </router-link>
          </template>
        </Column>
        <Column field="CONCEPT_NAME" header="Concept Name">
          <template #body="slotProps">
            <router-link
              class="text-blue-400 hover:underline"
              :to="getReportRoute(slotProps.data)"
              :title="slotProps.data.CONCEPT_NAME"
              >{{ slotProps.data.CONCEPT_NAME }}
            </router-link>
          </template>
        </Column>
        <Column
          sortable
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="TOTAL_COST"
          header="Total Cost"
        >
          <template #body="slotProps">
            {{
              parseFloat(slotProps.data.TOTAL_COST) &&
              !isNaN(parseFloat(slotProps.data.TOTAL_COST))
                ? `$ ${formatComma(slotProps.data.TOTAL_COST)}`
                : "No data"
            }}
          </template>
        </Column>
      </DataTable>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { computed } from "vue";
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
import { formatComma } from "@/shared/lib/mixins/methods/formatComma";

const store = useStore();
const route = useRoute();
const router = useRouter();

const newFilters = computed(() => ({
  global: { value: route.query.search, matchMode: FilterMatchMode.CONTAINS },
}));

const debouncedSearch = debounce(function (data: string): void {
  router.push({
    query: {
      search: data,
    },
  });
}, 300);

const getReportRoute = function (item) {
  return {
    name: "costDrilldown",
    params: { concept: item.CONCEPT_ID },
  };
};

const data = computed(() => {
  return store.getters.getData;
});

const table = computed(() => {
  return data.value.costTable.filter(
    (item) => item.DOMAIN_ID === route.params.domain
  );
});
</script>

<style scoped>
.p-inputtext {
  width: 200%;
}
</style>
