<template>
  <Panel header="Record Proportion by Month">
    <template #icons>
      <ChartHeader
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
        table-toggle
        @table-toggled="toggleTable"
      />
    </template>
    <Echarts
      id="viz-sourcerecordproportionbymonth"
      :data="data"
      :chart-spec="getEChartsSpec"
      :annotation-mode="annotationsMode"
      :annotations="annotations"
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
        <Column sortable header="Month" field="X_CALENDAR_MONTH" />
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Record Proportion Per 1000"
          field="Y_PREVALENCE_1000PP"
        />
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
            openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .PREVALENCE_BY_MONTH[0]
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
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/echarts/chartHeader";
import ChartActionIcon from "@/shared/ui/toggleIcon";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";
import Echarts from "@/widgets/echarts/echarts";
import getEChartsRecordProportionByMonth from "./echartsRecordProportionByMonth";
import { openNewTab } from "@/shared/lib/utils";

const store = useStore();
const route = useRoute();

const reportId = "viz-sourcerecordproportionbymonth";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);

const showTable = ref(false);

function toggleTable(mode: boolean) {
  showTable.value = mode;
}

const data = computed(() => store.getters.getData?.conceptData ?? []);

const getEChartsSpec = computed(() =>
  getEChartsRecordProportionByMonth({ data: data.value })
);
</script>

<style scoped></style>
