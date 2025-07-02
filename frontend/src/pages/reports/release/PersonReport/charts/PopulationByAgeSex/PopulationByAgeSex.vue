<template>
  <Panel
    header="Population by Age &amp; Sex"
    :loading="!store.getters.getData"
    class="flex flex-col"
  >
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
      id="viz-populationAgeSexPerson"
      :data="store.getters.getData.genSexData"
      :chart-spec="getEChartsOptionAgeSex"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
        removable-sort
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="store.getters.getData.personData.AGE_GENDER_DATA"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Concept ID" field="CONCEPT_ID"> </Column>
        <Column sortable header="Sex" field="CONCEPT_NAME"> </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="AGE"
          field="AGE"
        >
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="# of People"
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
    <NotesPanel v-if="notesMode" :notes="allNotes" />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.PERSON.AGE_GENDER_DATA
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
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { helpers } from "@/shared/lib/mixins";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

//todo: fix issues with annotations not being saved

import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsOptionAgeSex from "@/pages/reports/release/PersonReport/charts/PopulationByAgeSex/personAgeSex";

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const store = useStore();

const reportId = "viz-populationAgeSexPerson";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);
</script>

<style scoped></style>
