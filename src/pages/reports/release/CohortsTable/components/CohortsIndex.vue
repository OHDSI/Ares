<template>
  <Panel header="Cohorts Table">
    <div class="p-5">
      <DataTable
        removable-sort
        size="small"
        :value="data"
        paginator
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
            <router-link
              class="text-blue-400 hover:underline"
              :to="getReportRoute(slotProps.data)"
              :title="slotProps.data.cohort_id"
              >{{ slotProps.data.cohort_id }}
            </router-link>
          </template>
        </Column>
        <Column field="cohort_name" header="Cohort Name">
          <template #body="slotProps">
            <router-link
              class="text-blue-400 hover:underline"
              :to="getReportRoute(slotProps.data)"
              :title="slotProps.data.cohort_name"
              >{{ slotProps.data.cohort_name }}
            </router-link>
          </template>
        </Column>
        <Column
          sortable
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="cohort_subjects"
          header="# People"
        >
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
import { COHORT_INDEX } from "@/shared/config/files";

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
    name: "cohortReport",
    params: { cohort_id: item.cohort_id },
  };
};

const data = computed(() => {
  return store.getters.getData[COHORT_INDEX];
});
</script>

<style scoped>
.p-inputtext {
  width: 200%;
}
</style>
