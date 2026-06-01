<template>
  <Panel header="Years of Observation By Sex">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Echarts
      id="viz-observationbysex"
      :data="data"
      :chart-spec="getEChartsOptionYearsObservationBySex"
    />
    <CollapseTransition>
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
          <Column sortable header="Sex" field="CATEGORY"> </Column>
          <Column
            style="text-align: end"
            :pt="{ headerContent: 'justify-end' }"
            sortable
            header="MIN_VALUE"
            field="MIN_VALUE"
          >
          </Column>
          <Column
            style="text-align: end"
            :pt="{ headerContent: 'justify-end' }"
            sortable
            header="P10_VALUE"
            field="P10_VALUE"
          >
          </Column>
          <Column
            style="text-align: end"
            :pt="{ headerContent: 'justify-end' }"
            sortable
            header="P25_VALUE"
            field="P25_VALUE"
          >
          </Column>
          <Column
            style="text-align: end"
            :pt="{ headerContent: 'justify-end' }"
            sortable
            header="MEDIAN_VALUE"
            field="MEDIAN_VALUE"
          >
          </Column>
          <Column
            style="text-align: end"
            :pt="{ headerContent: 'justify-end' }"
            sortable
            header="P75_VALUE"
            field="P75_VALUE"
          >
          </Column>
          <Column
            style="text-align: end"
            :pt="{ headerContent: 'justify-end' }"
            sortable
            header="P90_VALUE"
            field="P90_VALUE"
          >
          </Column>
          <Column
            style="text-align: end"
            :pt="{ headerContent: 'justify-end' }"
            sortable
            header="MAX_VALUE"
            field="MAX_VALUE"
          >
          </Column>
        </DataTable>
      </div>
    </CollapseTransition>
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .OBSERVATION_PERIOD_LENGTH_BY_GENDER[0],
              ),
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
import ChartActionIcon from "@/shared/ui/toggleIcon";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import ChartHeader from "@/widgets/echarts/chartHeader";
import { computed, ref } from "vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Echarts from "@/widgets/echarts/echarts";
import getEChartsOptionYearsObservationBySex from "@/pages/reports/release/ObservationPeriodReport/charts/YearsOfObservationBySex/yearsObservationBySex";
import { openNewTab } from "@/shared/lib/utils";

const store = useStore();

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return store.getters.getData.observationPeriodData
    .OBSERVATION_PERIOD_LENGTH_BY_GENDER;
});
</script>

<style scoped></style>
