<template>
  <Panel header="Population by Race" :loading="!store.getters.getData">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Echarts id="viz-race" :data="data" :chart-spec="specRaceECharts" />
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
          <Column sortable header="Concept ID" field="CONCEPT_ID"> </Column>
          <Column sortable header="Race" field="CONCEPT_NAME"> </Column>
          <Column
            :pt="{ headerContent: 'justify-end' }"
            sortable
            header="Number of People"
            field="COUNT_VALUE"
          >
            <template #body="slotProps">
              <div class="flex justify-end">
                {{
                  slotProps.data.COUNT_VALUE
                    ? formatComma(slotProps.data.COUNT_VALUE)
                    : "No data"
                }}
              </div>
            </template>
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
                store.getters.getQueryIndex.PERSON.RACE_DATA,
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
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ChartHeader from "@/widgets/echarts/chartHeader";
import { computed, ref } from "vue";
import Echarts from "@/widgets/echarts/echarts";
import specRaceECharts from "@/pages/reports/release/PersonReport/charts/PopulationByRace/populationByRace";
import { formatComma } from "@/shared/lib/formatters";
import { openNewTab } from "@/shared/lib/utils";

const store = useStore();

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return store.getters.getData.personData.RACE_DATA;
});
</script>

<style scoped></style>
