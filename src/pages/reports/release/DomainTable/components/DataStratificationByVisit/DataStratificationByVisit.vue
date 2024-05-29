<template>
  <Panel
    header="Domain Data Stratification By Visit"
    v-if="route.params.domain.toUpperCase() === 'VISIT_OCCURRENCE'"
  >
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Chart
      v-if="data"
      id="viz-stratificationbyvisit"
      :chartSpec="specVisitStratification"
      :data="data"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        removable-sort
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="data"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Concept ID" field="CONCEPT_ID"> </Column>
        <Column sortable header="CONCEPT_NAME" field="CONCEPT_NAME"> </Column>
        <Column sortable header="# Records" field="RECORD_COUNT"> </Column>
      </DataTable>
    </div>
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Any domain data categorized as a Visit of 'No matching concept' implies
            that this data had no associated Visit on the Domain record."
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specVisitStratification } from "./specVisitStratification";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiHelpCircle } from "@mdi/js";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { computed, ref } from "vue";

const store = useStore();
const route = useRoute();

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return store.getters.getData.domainStratification;
});
</script>

<style scoped></style>
