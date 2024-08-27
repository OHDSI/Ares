<template>
  <Panel header="Data Sources">
    <DataTable
      size="small"
      showGridlines
      :value="augmentedData"
      v-model:filters="newFilters"
      :globalFilterFields="['cdm_source_name', 'releases[0].release_name', '']"
      paginator
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      :rows="20"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      tableStyle="min-width: 50rem"
    >
      <template #header>
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
      </template>
      <Column field="cdm_source_name" header="Data Source">
        <template #body="slotProps">
          <router-link
            class="text-blue-400 hover:underline"
            :to="getDataSourceRoute(slotProps.data.cdm_source_key)"
            >{{ slotProps.data.cdm_source_name }}</router-link
          >
        </template>
      </Column>
      <Column field="releases[0].obs_period_start" header="Start Observed">
        <template #body="slotProps">
          {{ slotProps.data.releases[0].obs_period_start }}
        </template>
      </Column>
      <Column field="releases[0].obs_period_end" header="End Observed">
        <template #body="slotProps">
          {{ slotProps.data.releases[0].obs_period_end }}
        </template>
      </Column>
      <Column field="releases[0].release_name" header="Latest Release">
        <template #body="slotProps">
          {{ slotProps.data.releases[0].release_name }}
        </template>
      </Column>
      <Column
        field="releases[0].vocabulary_version"
        header="Vocabulary Version"
      >
        <template #body="slotProps">
          {{ slotProps.data.releases[0].vocabulary_version }}
        </template>
      </Column>
      <Column
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="releases[0].count_data_quality_issues"
        header="Data Quality Issues"
      >
        <template #body="slotProps">
          <div class="flex items-center justify-end">
            {{ slotProps.data.releases[0].count_data_quality_issues }}

            <svg-icon
              v-if="slotProps.data.issue_delta === 1"
              class="text-red-600 text-lg"
              type="mdi"
              :path="mdiArrowUp"
            ></svg-icon>
            <svg-icon
              v-if="slotProps.data.issue_delta === -1"
              class="text-green-600 text-lg"
              type="mdi"
              :path="mdiArrowDown"
            ></svg-icon>
            <svg-icon
              v-if="slotProps.data.issue_delta === 0"
              class="text-gray-600 text-lg"
              type="mdi"
              :path="mdiMinus"
            ></svg-icon>
          </div>
        </template>
      </Column>
      <Column
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="count_releases"
        header="Data Source Releases"
      ></Column>

      <Column
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="releases[0].count_person"
        header="Person Count"
      >
        <template #body="slotProps">
          {{
            slotProps.data.releases[0].count_person
              ? helpers.formatComma(slotProps.data.releases[0].count_person)
              : 0
          }}
        </template>
      </Column>
      <Column
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="average_update_interval_days"
        header="Average Update Frequency (days)"
      >
        <template #body="slotProps">
          {{ slotProps.data.average_update_interval_days }}
        </template>
      </Column>
    </DataTable>
  </Panel>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { debounce } from "lodash";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputGroup from "primevue/inputgroup";
import { useRoute, useRouter } from "vue-router";
import { FilterMatchMode } from "primevue/api";
import { helpers } from "@/shared/lib/mixins";
import { mdiArrowDown, mdiArrowLeft, mdiArrowUp, mdiMinus } from "@mdi/js";
import SvgIcon from "@jamescoyle/vue-icon";

const store = useStore();
const route = useRoute();
const router = useRouter();

const data = ref(store.getters.getSources);

const augmentedData = computed(() => {
  return data.value.map((source) => {
    const releases = source.releases;
    let status;
    if (releases.length > 1) {
      const moreIssues =
        releases[0].count_data_quality_issues >
        releases[1].count_data_quality_issues;

      const noChanges =
        releases[0].count_data_quality_issues ===
        releases[1].count_data_quality_issues;
      status = moreIssues ? 1 : noChanges ? 0 : -1;
    } else {
      status = 0;
    }
    return {
      ...source,
      issue_delta: status,
    };
  });
});

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

function getDataSourceRoute(cdm_source_key) {
  return {
    name: "dataSourceOverview",
    params: { cdm: cdm_source_key },
  };
}
</script>

<style scoped></style>
