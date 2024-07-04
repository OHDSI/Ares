<template>
  <Panel header="Record Count Proportion by Month">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Chart
      :id="reportId"
      :chartSpec="specRecordProportionByMonth"
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
        <Column sortable header="Source" field="SOURCE"> </Column>

        <Column sortable header="Date" field="date">
          <template #body="slotProps">
            <div>
              {{
                slotProps.data.X_CALENDAR_MONTH
                  ? slotProps.data.X_CALENDAR_MONTH
                  : "no data"
              }}
            </div>
          </template>
        </Column>

        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="RPP1000"
          field="Y_PREVALENCE_1000PP"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.Y_PREVALENCE_1000PP
                  ? helpers.formatComma(slotProps.data.Y_PREVALENCE_1000PP)
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
          tooltip="Proportion of people with at least one record per 1000 people."
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
import { specRecordProportionByMonth } from "./specRecordProportionByMonth";
import { useStore } from "vuex";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import Panel from "primevue/panel";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { computed } from "vue";
import useChartControls from "@/shared/lib/composables/useChartControls";

interface Props {
  data: [];
}

const props = defineProps<Props>();
const store = useStore();

const reportId = "viz-networkrecordproportionbymonth";

const sqlLink = links.getSqlQueryLink(
  store.getters.getQueryIndex.PREVALENCE_BY_MONTH?.[0]
);

const { showTable, toggleTable } = useChartControls();

const data = computed(() => {
  return props.data;
});
</script>

<style scoped></style>
