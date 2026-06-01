<template>
  <Panel header="Data Strands">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Echarts
      id="viz-sourcedatastrand"
      :data="data"
      :chart-spec="getEChartsDatastrand"
      :height="totalHeight"
    />
    <CollapseTransition>
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
          <Column field="domain" header="Domain"> </Column>
          <Column
            :pt="{ headerContent: 'justify-end' }"
            sortable
            header="Number of Records"
            field="count_records"
          >
            <template #body="slotProps">
              <div class="flex justify-end">
                {{
                  slotProps.data.count_records
                    ? formatComma(slotProps.data.count_records)
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
          :icon="mdiHelpCircle"
          tooltip="Data strands are simple visualizations that describe the composition of
            a data source across the various CDM domain tables. Each individual
            strand shows the percentage of the data source comprised of data from a
            particular domain table. Across the network, the strands can be visually
            compared and contrasted."
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.DOMAIN_SUMMARY.RECORDS_BY_DOMAIN[0],
              ),
            )
          "
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from "vuex";
import ChartActionIcon from "@/shared/ui/toggleIcon";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import ChartHeader from "@/widgets/echarts/chartHeader";
import Column from "primevue/column";
import DataTable from "primevue/datatable";

const store = useStore();

import { links } from "@/shared/config/links";
import Echarts from "@/widgets/echarts/echarts";
import getEChartsDatastrand from "@/pages/reports/source/SourceOverview/charts/sourceDataStrand/dataStrand";
import { formatComma } from "@/shared/lib/formatters";
import { getValuesArray, openNewTab } from "@/shared/lib/utils";

const data = computed(() => store.getters.getData.dataStrandReport);

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const trellis = getValuesArray(data.value, "cdm_release_key", true);

const facetCount = trellis.length;
const perFacetHeight = 50;
const minHeight = 200;

const totalHeight = `${Math.max(facetCount * perFacetHeight, minHeight)}px`;
</script>

<style scoped>
.viz-container {
  width: 95%;
}
</style>
