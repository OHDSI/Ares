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
                  ? helpers.formatComma(slotProps.data.count_records)
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
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.DOMAIN_SUMMARY.RECORDS_BY_DOMAIN[0]
              )
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
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";

const store = useStore();

import { links } from "@/shared/config/links";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsDatastrand from "@/pages/reports/source/SourceOverview/charts/sourceDataStrand/dataStrand";

const data = computed(() => store.getters.getData.dataStrandReport);

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const trellis = helpers.getValuesArray(data.value, "cdm_release_key", true);

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
