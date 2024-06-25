<template>
  <Panel header="Conditions by Type">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Chart
      id="viz-conditionsbytype"
      :chartSpec="specConditionsByType"
      :data="data"
    />
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
          v-if="sqlLink"
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

import { specConditionsByType } from "./specConditionsByType";
import { useStore } from "vuex";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { computed } from "vue";
import useChartControls from "@/shared/lib/composables/useChartControls";

const store = useStore();

const { showTable, toggleTable } = useChartControls();

const sqlLink = links.getSqlQueryLink(
  store.getters.getQueryIndex.CONDITIONS_BY_TYPE?.[0]
);

const data = computed(() => {
  return store.getters.getData.conceptData.CONDITIONS_BY_TYPE;
});
</script>

<style scoped></style>
