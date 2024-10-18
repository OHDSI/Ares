<template>
  <Panel header="Achilles Performance">
    <DataTable
      size="small"
      :globalFilterFields="['analysis_id', 'analysis_name']"
      paginator
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      v-model:filters="newFilters"
      :value="filteredRecords"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
    >
      <template #header>
        <div>
          <InputGroup unstyled>
            <InputGroupAddon>
              <i class="pi pi-search"></i>
            </InputGroupAddon>
            <InputText
              class="rounded-r-lg"
              style="width: 45rem"
              unstyled
              v-model="newFilters['global'].value"
              placeholder="Search in Table"
            />
          </InputGroup>
        </div>
      </template>
      <Column sortable header="Analysis Id" field="analysis_id">
        <template #body="slotProps">
          <div>
            <a
              target="_new"
              :href="
                links.getSqlQueryLink(
                  `analyses/${slotProps.data.analysis_id}.sql`
                )
              "
              >{{ slotProps.data.analysis_id }}</a
            >
          </div>
        </template>
      </Column>
      <Column sortable header="Analysis Name" field="analysis_name"></Column>
      <Column
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        sortable
        header="Duration (seconds)"
        field="elapsed_seconds"
      ></Column>
    </DataTable>
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Proportion of people with at least one record per 1000 people."
        />
        <ChartActionIcon
          :icon="mdiOpenInNew"
          tooltip="This report
              describes how long each analysis executed during Achilles characterization took to run in seconds."
          @iconClicked="helpers.openNewTab(links.getAchillesLink())"
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.ACHILLES_PERFORMANCE[0]
              )
            )
          "
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { helpers } from "@/shared/lib/mixins";
import { links } from "@/shared/config/links";
import { ref, computed } from "vue";
import { useStore } from "vuex";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import InputText from "primevue/inputtext";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import { FilterMatchMode } from "primevue/api";
import { mdiCodeBraces, mdiHelpCircle, mdiOpenInNew } from "@mdi/js";

const store = useStore();

const filters = ref({});
const newFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const filteredRecords = computed(function () {
  return store.getters.getData.achilles_performance.filter((d) => {
    return Object.keys(filters.value).every((f) => {
      return (
        filters.value[f as keyof typeof filters].length < 1 ||
        filters.value[f as keyof typeof filters].includes(d[f])
      );
    });
  });
});
</script>

<style scoped></style>
