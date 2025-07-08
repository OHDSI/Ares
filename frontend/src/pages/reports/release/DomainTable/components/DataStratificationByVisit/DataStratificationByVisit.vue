<template>
  <Panel header="Domain Data Stratification By Visit" v-if="showChart">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Echarts
      v-if="data"
      id="viz-stratificationbyvisit"
      :data="data"
      :chart-spec="getEChartsOptionSpecVisitStratification"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
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
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiHelpCircle } from "@mdi/js";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { computed, ref, onMounted } from "vue";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsOptionSpecVisitStratification from "@/pages/reports/release/DomainTable/components/DataStratificationByVisit/visitStratification";

const store = useStore();
const route = useRoute();

const showTable = ref(false);

const showChart = route.params.domain === "visit_occurrence";

function toggleTable(mode) {
  showTable.value = mode;
}

const data = ref(null);

onMounted(() => {
  data.value = store.getters.getData.domainStratification;
});
</script>

<style scoped></style>
