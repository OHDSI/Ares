<template>
  <Panel header="Age at First Observation">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Echarts
      id="viz-networkageatfirstobservation"
      :data="data"
      :chart-spec="getEChartsNetworkAgeAtFirstObservation"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
        size="small"
        :value="data"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column field="DATA_SOURCE_KEY" header="Source"> </Column>

        <Column field="INTERVAL_INDEX" header="Age"> </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="% of Population"
          field="PERCENT_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.PERCENT_VALUE
                  ? helpers.formatPercent(slotProps.data.PERCENT_VALUE)
                  : "No data"
              }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .AGE_AT_FIRST_OBSERVATION[0]
              )
            )
          "
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { computed, ref } from "vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsNetworkAgeAtFirstObservation from "@/pages/reports/network/NetworkPopulationReport/charts/ageAtFirstObservation/networkAgeFirstObservation";

const store = useStore();

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return store.getters.getData.allAgeAtFirstObservationData;
});
</script>

<style scoped></style>
