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
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import _ from "lodash";
import { useRoute } from "vue-router";
import * as listeners from "@/pages/model/lib/listeners";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";

const store = useStore();

const route = useRoute();

const annotationsMode = ref(false);
const notesMode = ref(false);
function toggleAnnotationsMode(mode) {
  annotationsMode.value = mode;
}
function toggleNotesMode(mode) {
  notesMode.value = mode;
}

const reportId = "viz-recordsperperson";

const annotations = computed(() => {
  const { cdm, release, domain } = route.params;
  const path = [cdm, release, domain].filter(Boolean);
  const selections = _.get(store.getters.getNotes, path.join(".")) || {};
  return selections[reportId] || [];
});

const notes = computed(() => {
  if (annotations.value.length) {
    return annotations.value.reduce((acc, val) => {
      return [
        ...acc,
        ...val.notes.map((note) => ({
          ...note,
          report: reportId,
          selection: val.id,
        })),
      ];
    }, []);
  } else {
    return [];
  }
});
</script>

<style scoped></style>
