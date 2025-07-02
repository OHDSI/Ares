<template>
  <Panel header="Cost Time series" :loading="!store.getters.getData">
    <template #icons>
      <ChartHeader
        title="Population by Year of Birth"
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
        table-toggle
        @table-toggled="toggleTable"
      />
    </template>
    <Echarts
      v-if="data"
      :id="reportId"
      :data="data"
      :chart-spec="getEChartsOptionCostTimeSeries"
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
    <NotesPanel v-if="notesMode" :notes="notes" />
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
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import Panel from "primevue/panel";
import { onMounted } from "vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { ref } from "vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { mdiCodeBraces } from "@mdi/js";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsOptionCostTimeSeries from "@/pages/reports/release/CostTable/components/costTimeSeries/costTimeSeries";

const store = useStore();

const reportId = "viz-costtime";

const { notesMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);
const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = ref(null);

onMounted(() => {
  data.value = store.getters.getData.timeSeries;
});
</script>

<style scoped></style>
