<template>
  <Panel header="Cumulative Observation">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Chart
      id="viz-networkcumulativeobservation"
      :chartSpec="specCumulativeObservation"
      :data="data"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        size="small"
        :value="data"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column field="DATA_SOURCE_KEY" header="Source"> </Column>

        <Column field="YEARS" header="Years of Observation"> </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="% of Population"
          field="PERCENT_PEOPLE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.PERCENT_PEOPLE
                  ? helpers.formatPercent(slotProps.data.PERCENT_PEOPLE)
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
          @iconClicked="helpers.openNewTab(sqlLink)"
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { specCumulativeObservation } from "./specCumulativeObservation";
import { useStore } from "vuex";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { computed } from "vue";
import useChartControls from "@/shared/lib/composables/useChartControls";

const store = useStore();

const { showTable, toggleTable } = useChartControls();

const sqlLink = links.getSqlQueryLink(
  store.getters.getQueryIndex.OBSERVATION_PERIOD.CUMULATIVE_DURATION[0]
);

const data = computed(() => {
  return store.getters.getData.allCumulativeDurationData;
});
</script>

<style scoped></style>
