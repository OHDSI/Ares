<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <ChartHeader
      title="Domain Records per Person"
      :notes-count="annotations.length"
      @mode-toggled="toggleMode"
    />
    <Chart
      v-if="store.getters.dataInStore"
      :id="reportId"
      width="80"
      title="Domain Records per Person"
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
    <NotesPanel :notes="notes" />

    <InfoPanel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex.DATA_DENSITY.DATADENSITY_TOTAL[0]
        )
      "
      :divider="true"
    ></InfoPanel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
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

const store = useStore();

const route = useRoute();

const annotationsMode = ref(false);
function toggleMode(mode) {
  annotationsMode.value = mode;
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
