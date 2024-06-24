<template>
  <Panel header="Length of Era">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Chart id="viz-lengthofera" :chartSpec="specLengthOfEra" :data="data" />
    <div v-if="showTable" class="p-4">
      <DataTable
        removable-sort
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="data"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="CATEGORY" field="CATEGORY"> </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="MAX_VALUE"
          field="MAX_VALUE"
        >
        </Column>
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
import { specLengthOfEra } from "./specLengthOfEra";
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

const sqlLink = links.getSqlQueryLink(
  store.getters.getQueryIndex.LENGTH_OF_ERA[0]
);

const { showTable, toggleTable } = useChartControls();

const data = computed(() => {
  return store.getters.getData.conceptData.LENGTH_OF_ERA;
});
</script>

<style scoped></style>
