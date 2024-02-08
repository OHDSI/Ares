<template>
  <Panel
    header="Domain Records per Person"
    :loading="!store.getters.dataInStore"
  >
    <template #icons>
      <ChartHeader
        title="Domain Records per Person"
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
      />
    </template>
    <Chart
      v-if="store.getters.dataInStore"
      :id="reportId"
      width="80"
      :chartSpec="defRecordsPerPerson"
      :annotations-config="{
        chartSpec: defRecordsPerPersonAnnotation,
        annotationsParentElement: 'g g',
        brushParentElement: 'g g g',
      }"
      :signal-listener="listeners.setSelectionAreaSignal"
      :data="store.getters.getData.domainRecords"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
    />
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
                store.getters.getQueryIndex.DATA_DENSITY.DATADENSITY_TOTAL[0]
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
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { defRecordsPerPerson } from "./defRecordsPerPerson";
import { defRecordsPerPersonAnnotation } from "./defRecordsPerPersonAnnotation";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import * as listeners from "@/pages/model/lib/listeners";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";

const store = useStore();

const reportId = "viz-recordsperperson";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);
</script>

<style scoped></style>
