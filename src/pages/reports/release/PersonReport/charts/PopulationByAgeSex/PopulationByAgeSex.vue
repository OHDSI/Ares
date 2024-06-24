<template>
  <Panel
    header="Population by Age &amp; Sex"
    :loading="!store.getters.getData"
    class="flex flex-col"
  >
    <template #icons>
      <ChartHeader
        :notes-count="allNotes.length"
        :annotations-count="allAnnotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
        table-toggle
        @table-toggled="toggleTable"
      />
    </template>
    <Chart
      :id="maleReportId"
      title="Male"
      :annotations-config="{
        chartSpec: specAgeSex,

        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :data="store.getters.getData.maleAgeSex"
      :chartSpec="specAgeSex"
      :annotations="notesMale.annotations.value"
      :annotation-mode="annotationsMode"
    />
    <Chart
      :id="femaleReportId"
      title="Female"
      :annotations-config="{
        chartSpec: specAgeSex,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :data="store.getters.getData.femaleAgeSex"
      :chartSpec="specAgeSex"
      :annotations="notesFemale.annotations.value"
      :annotation-mode="annotationsMode"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
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
          @iconClicked="helpers.openNewTab(sqlLink)"
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specAgeSex } from "./specAgeSex";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { computed } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { helpers } from "@/shared/lib/mixins";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useChartControls from "@/shared/lib/composables/useChartControls";

const store = useStore();

const sqlLink = links.getSqlQueryLink(
  store.getters.getQueryIndex.PERSON.AGE_GENDER_DATA
);

const femaleReportId = "viz-populationbyageandsexFemale";
const maleReportId = "viz-populationbyageandsexMale";

const {
  notesMode,
  annotationsMode,
  toggleNotesMode,
  toggleAnnotationsMode,
  showTable,
  toggleTable,
} = useChartControls();

const notesMale = useAnnotations(maleReportId);

const notesFemale = useAnnotations(femaleReportId);

const allNotes = computed(() => {
  return [...notesMale.notes.value, ...notesFemale.notes.value];
});
const allAnnotations = computed(() => {
  return [...notesFemale.annotations.value, ...notesMale.annotations.value];
});
</script>

<style scoped></style>
