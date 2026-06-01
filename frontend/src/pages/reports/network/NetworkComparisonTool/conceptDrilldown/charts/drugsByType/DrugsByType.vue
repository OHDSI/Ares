<template>
  <Panel header="Drugs by Type">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Echarts
      id="viz-drugsbytype"
      :data="data"
      :chart-spec="getEChartsDrugsByTypeFaceted"
      :height="totalHeight"
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
          <Column sortable header="Source" field="SOURCE"> </Column>

          <Column sortable header="Drug Type" field="CONCEPT_NAME"> </Column>
          <Column
            :pt="{ headerContent: 'justify-end' }"
            sortable
            header="Number of Records"
            field="COUNT_VALUE"
          >
            <template #body="slotProps">
              <div class="flex justify-end">
                {{
                  slotProps.data.COUNT_VALUE
                    ? formatComma(slotProps.data.COUNT_VALUE)
                    : 0
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
          tooltip="Learn about drug types."
          @iconClicked="openNewTab(links.getDocsLink('DRUG_EXPOSURE'))"
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .DRUGS_BY_TYPE[0],
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
import { useRoute } from "vue-router";
import ChartActionIcon from "@/shared/ui/toggleIcon";

import { RecordsCountType } from "@/processes/exploreReports/model/interfaces/reportTypes/RecordsCountType";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import Panel from "primevue/panel";
import ChartHeader from "@/widgets/echarts/chartHeader";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { computed, ref } from "vue";
import Echarts from "@/widgets/echarts/echarts";
import getEChartsDrugsByTypeFaceted from "@/pages/reports/network/NetworkComparisonTool/conceptDrilldown/charts/drugsByType/drugsByType";
import { formatComma } from "@/shared/lib/formatters";
import { getValuesArray, openNewTab } from "@/shared/lib/utils";

interface Props {
  data: RecordsCountType[];
}

const props = defineProps<Props>();

const store = useStore();
const route = useRoute();
const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return props.data;
});

const sources = getValuesArray(data.value, "SOURCE", true);

const facetCount = sources.length;
const perFacetHeight = 100;

const totalHeight = `${facetCount * perFacetHeight}px`;
</script>

<style scoped></style>
