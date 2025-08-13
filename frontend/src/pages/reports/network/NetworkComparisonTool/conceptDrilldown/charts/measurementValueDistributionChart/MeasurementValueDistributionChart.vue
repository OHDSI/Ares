<template>
  <Panel header="Measurement Value Distributions by Database and Unit">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <div class="pa-4">
      <MultiSelect
        v-model="selectedMeasurementUnits"
        class="mr-13"
        :options="getMeasurementUnits"
        variant="outlined"
        hide-selected
        closable-chips
        chips
        label="Filter units"
        multiple
      ></MultiSelect>
    </div>
    <Echarts
      id="viz-networkmeasurementvaluedistribution"
      :data="
        getSelectedMeasurementUnitsChart ? getSelectedMeasurementUnitsChart : []
      "
      :chart-spec="getEChartsOptionMeasurementDistributionFaceted"
      :height="totalHeight"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
        removable-sort
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="
          getSelectedMeasurementUnitsTable
            ? getSelectedMeasurementUnitsTable
            : []
        "
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Source" field="SOURCE"></Column>
        <Column sortable header="Unit" field="CATEGORY"></Column>
        <Column
          sortable
          header="Unit Concept ID"
          field="UNIT_CONCEPT_ID"
        ></Column>
        <Column sortable header="Release" field="RELEASE"></Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Count Value"
          field="UNIT_COUNT"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.UNIT_COUNT
                  ? helpers.formatComma(slotProps.data.UNIT_COUNT)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="MIN_VALUE"
          field="MIN_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.MIN_VALUE
                  ? helpers.formatComma(slotProps.data.MIN_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P10_VALUE"
          field="P10_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.P10_VALUE
                  ? helpers.formatComma(slotProps.data.P10_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P25_VALUE"
          field="P25_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.P25_VALUE
                  ? helpers.formatComma(slotProps.data.P25_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="MEDIAN_VALUE"
          field="MEDIAN_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.MEDIAN_VALUE
                  ? helpers.formatComma(slotProps.data.MEDIAN_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P75_VALUE"
          field="P75_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.P75_VALUE
                  ? helpers.formatComma(slotProps.data.P75_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P90_VALUE"
          field="P90_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.P90_VALUE
                  ? helpers.formatComma(slotProps.data.P90_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="MAX_VALUE"
          field="MAX_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.MAX_VALUE
                  ? helpers.formatComma(slotProps.data.MAX_VALUE)
                  : 0
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
          tooltip="Learn how
              to interpret this plot."
          @iconClicked="openNewTab(links.getAresDocsLink())"
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.MEASUREMENT
                  .MEASUREMENT_VALUE_DISTRIBUTION[0]
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
import { computed, ref, Ref } from "vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";
import Panel from "primevue/panel";
import MultiSelect from "primevue/multiselect";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { openNewTab } from "@/shared/lib/mixins/methods/openNewTab";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsOptionMeasurementDistributionFaceted from "@/pages/reports/network/NetworkComparisonTool/conceptDrilldown/charts/measurementValueDistributionChart/measurementValueDistribution";

const store = useStore();

interface Props {
  data: { chart: DistributionType[]; table: DistributionType[] };
}

const props = defineProps<Props>();

const getMeasurementUnits = computed(function () {
  return [...new Set(props.data.chart.map((value) => value.CATEGORY))];
});

const selectedMeasurementUnits: Ref<string[]> = ref([]);

const getSelectedMeasurementUnitsChart = computed(function () {
  return selectedMeasurementUnits.value.length
    ? props.data.chart.filter((value) =>
        selectedMeasurementUnits.value.includes(value.CATEGORY)
      )
    : props.data.chart;
});

const getSelectedMeasurementUnitsTable = computed(function () {
  return selectedMeasurementUnits.value.length
    ? props.data.table.filter((value) =>
        selectedMeasurementUnits.value.includes(value.CATEGORY)
      )
    : props.data.table;
});

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const sources = helpers.getValuesArray(props.data.chart, "SOURCE", true);

const facetCount = sources.length;
const perFacetHeight = 130;

const totalHeight = `${facetCount * perFacetHeight}px`;
</script>

<style scoped></style>
