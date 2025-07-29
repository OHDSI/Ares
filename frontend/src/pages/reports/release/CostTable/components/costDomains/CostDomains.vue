<template>
  <Panel header="Cost Domains" :loading="!store.getters.getData">
    <template #icons>
      <Dropdown
        option-label="label"
        option-value="value"
        v-model="selectedMetric"
        :options="items"
      />
    </template>
    <Echarts
      v-if="data"
      :id="reportId"
      :data="renderedData"
      :chart-spec="getEChartsOptionCostDomains"
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
        <Column sortable header="Date" field="MONTH_YEAR"> </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="# of People"
          field="TOTAL_COST"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              $
              {{
                slotProps.data.TOTAL_COST
                  ? helpers.formatComma(slotProps.data.TOTAL_COST)
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
                store.getters.getQueryIndex.PERSON.BIRTH_YEAR_DATA
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
import Panel from "primevue/panel";
import { computed, onMounted } from "vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { ref } from "vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { mdiCodeBraces } from "@mdi/js";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsOptionCostDomains from "@/pages/reports/release/CostTable/components/costDomains/costDomains";
import Dropdown from "primevue/dropdown";

const store = useStore();

const reportId = "viz-costdomains";

const selectedMetric = ref(null);

const items = [
  {
    label: "Total Cost",
    value: "TOTAL_COST",
  },
  {
    label: "Total Paid",
    value: "TOTAL_PAID",
  },
  { label: "Total Charge", value: "TOTAL_CHARGE" },
];

const showTable = ref(false);

const data = computed(() => store.getters.getData.costTable);

const renderedData = computed(() => {
  return data.value.map((val) => ({
    ...val,
    showedData: val[selectedMetric.value],
  }));
});

onMounted(() => {
  const totals = data.value.reduce(
    (acc, curr) => {
      acc.TOTAL_COST += Number(curr.TOTAL_COST) || 0;
      acc.TOTAL_PAID += Number(curr.TOTAL_PAID) || 0;
      acc.TOTAL_CHARGE += Number(curr.TOTAL_CHARGE) || 0;
      return acc;
    },
    { TOTAL_COST: 0, TOTAL_PAID: 0, TOTAL_CHARGE: 0 }
  );

  const hasCostData = Object.entries(totals)
    .filter(([, val]) => val !== 0)
    .map(([key]) => key);

  selectedMetric.value = hasCostData[0];
});
</script>

<style scoped></style>
