<template>
  <Panel
    header="Population by Age &amp; Sex"
    :loading="!store.getters.getData"
    class="flex flex-col"
  >
    <template #icons>
      <ChartHeader
        :notes-count="notesMaleFemale.length"
        :annotations-count="notesFemale.length + notesMale.length"
        @annotations-mode-toggled="toggleAnnotationMode"
        @notes-mode-toggled="toggleNoteMode"
        table-toggle
        @table-toggled="toggleTable"
      />
    </template>
    <Chart
      v-if="store.getters.dataInStore"
      :id="maleReportId"
      title="Male"
      :annotations-config="{
        chartSpec: specAgeSex,

        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :data="store.getters.getData.maleAgeSex"
      :chartSpec="specAgeSex"
      :annotations="notesMale"
      :annotation-mode="annotationsMode"
    />
    <Chart
      v-if="store.getters.dataInStore"
      :id="femaleReportId"
      title="Female"
      :annotations-config="{
        chartSpec: specAgeSex,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :data="store.getters.getData.femaleAgeSex"
      :chartSpec="specAgeSex"
      :annotations="notesFemale"
      :annotation-mode="annotationsMode"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        removable-sort
        size="small"
        paginator
        :value="store.getters.getData.personData.AGE_GENDER_DATA"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Concept ID" field="CONCEPT_ID"> </Column>
        <Column sortable header="Sex" field="CONCEPT_NAME"> </Column>
        <Column sortable header="AGE" field="AGE"> </Column>
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

    <NotesPanel v-if="notesMode" :notes="notesMaleFemale" />
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
import { Chart } from "@/widgets/chart";
import { specAgeSex } from "./specAgeSex";
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

const annotationsMode = ref(false);
const notesMode = ref(false);

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

function toggleAnnotationMode(mode) {
  annotationsMode.value = mode;
}
function toggleNoteMode(mode) {
  notesMode.value = mode;
}

const store = useStore();
const releaseContainer = computed(() => {
  const sourceName = store.getters.getSelectedSource.cdm_source_key;
  const releaseName = store.getters.getSelectedRelease.release_id;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  return sourceContainer[releaseName] || {};
});

const femaleReportId = "viz-populationbyageandsexFemale";
const maleReportId = "viz-populationbyageandsexMale";

const notesFemale = computed(() => {
  return releaseContainer.value[femaleReportId] || [];
});
const notesMale = computed(() => {
  return releaseContainer.value[maleReportId] || [];
});

const notesMaleFemale = computed(() => {
  return [
    ...notesFemale.value.reduce((acc, val) => {
      return [
        ...acc,
        ...val.notes.map((note) => ({
          ...note,
          report: femaleReportId,
          selection: val.id,
        })),
      ];
    }, []),
    ...notesMale.value.reduce((acc, val) => {
      return [
        ...acc,
        ...val.notes.map((note) => ({
          ...note,
          report: maleReportId,
          selection: val.id,
        })),
      ];
    }, []),
  ];
});
</script>

<style scoped></style>
