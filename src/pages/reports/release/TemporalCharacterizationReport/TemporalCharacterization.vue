<template>
  <Panel header="Temporal Characterization">
    <DataTable
      size="small"
      :globalFilterFields="[
        'CDM_TABLE_NAME',
        'CONCEPT_ID',
        'CONCEPT_NAME',
        'SEASONALITY_SCORE',
        'IS_STATIONARY',
      ]"
      removable-sort
      paginator
      v-model:filters="newFilters"
      :value="filteredChecks"
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
      <Column sortable header="Table" field="CDM_TABLE_NAME"> </Column>
      <Column sortable header="Concept Id" field="CONCEPT_ID">
        <template #body="slotProps">
          <router-link :to="getReportRoute(slotProps.data)">{{
            slotProps.data.CONCEPT_ID
          }}</router-link>
        </template>
      </Column>
      <Column sortable header="Concept Name" field="CONCEPT_NAME">
        <template #body="slotProps">
          <router-link :to="getReportRoute(slotProps.data)">{{
            slotProps.data.CONCEPT_NAME
          }}</router-link>
        </template>
      </Column>

      <Column sortable header="Is Stationary" field="IS_STATIONARY"></Column>
      <Column
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        sortable
        header="Seasonality Score"
        field="SEASONALITY_SCORE"
      ></Column>
    </DataTable>
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          v-if="
            store.getters.getQueryIndex &&
            store.getters.getQueryIndex.TEMPORAL_CHARACTERIZATION
          "
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.TEMPORAL_CHARACTERIZATION[0]
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
import { computed, ref } from "vue";
import { useStore } from "vuex";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import InputGroup from "primevue/inputgroup";
import InputText from "primevue/inputtext";
import InputGroupAddon from "primevue/inputgroupaddon";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { FilterMatchMode } from "primevue/api";
import { mdiCodeBraces } from "@mdi/js";

const store = useStore();
const newFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const filters = ref({
  CDM_TABLE_NAME: [],
  IS_STATIONARY: [],
});

const filteredChecks = computed(function () {
  return store.getters.getData.temporalCharacterization.filter((d) => {
    return Object.keys(filters.value).every((f) => {
      return (
        filters.value[f as keyof typeof filters].length < 1 ||
        filters.value[f as keyof typeof filters].includes(d[f])
      );
    });
  });
});

function getReportRoute(item: {
  CDM_TABLE_NAME: string;
  CONCEPT_ID: string | number;
}) {
  return {
    name: "concept",
    params: {
      domain: item.CDM_TABLE_NAME.toLowerCase(),
      concept: item.CONCEPT_ID,
    },
  };
}
</script>

<style scoped></style>
