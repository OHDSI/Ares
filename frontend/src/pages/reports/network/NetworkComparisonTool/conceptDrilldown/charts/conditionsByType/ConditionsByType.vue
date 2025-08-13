<template>
  <Panel header="Conditions by Type">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Echarts
      id="viz-conditionsbytype"
      :data="data"
      :height="totalHeight"
      :chart-spec="getEChartsConditionsByTypeFacet"
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
        <Column sortable header="Source" field="SOURCE"> </Column>

        <Column sortable header="Condition Type" field="CONCEPT_NAME"> </Column>
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
                  ? helpers.formatComma(slotProps.data.COUNT_VALUE)
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
          tooltip="Learn about Condition types."
          @iconClicked="
            helpers.openNewTab(links.getDocsLink('CONDITION_OCCURRENCE'))
          "
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .CONDITIONS_BY_TYPE[0]
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
import { useRoute } from "vue-router";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { RecordsCountType } from "@/processes/exploreReports/model/interfaces/reportTypes/RecordsCountType";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import Panel from "primevue/panel";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { computed, ref } from "vue";
import Echarts from "@/widgets/echarts/Echarts.vue";
import { getEChartsConditionsByTypeFacet } from "@/pages/reports/network/NetworkComparisonTool/conceptDrilldown/charts/conditionsByType/conditionsBytype";

const props = defineProps<Props>();

const data = computed(() => {
  return props.data;
});

const sources = helpers.getValuesArray(data.value, "SOURCE", true);

const facetCount = sources.length;
const perFacetHeight = 120;

const totalHeight = `${facetCount * perFacetHeight}px`;

const store = useStore();
const route = useRoute();
interface Props {
  data: RecordsCountType[];
}

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}
</script>

<style scoped></style>
