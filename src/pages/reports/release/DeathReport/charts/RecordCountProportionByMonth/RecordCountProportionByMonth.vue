<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-deathrecordproportionbymonth"
      width="90"
      :notes="notes"
      :signal-listener="listeners.setSelectionAreaSignal"
      showAnnotations
      :annotations-config="{
        chartSpec: specRecordProportionByMonthAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :chartSpec="specRecordProportionByMonth"
      :data="store.getters.getData.PREVALENCE_BY_MONTH"
      title="Record Count Proportion by Month"
    />
    <NotesPanel report="viz-deathrecordproportionbymonth" />
    <infopanel
      details="Proportion of people with at least one record per 1000 people."
      :divider="true"
    ></infopanel>
    <infopanel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.name.toUpperCase()]
            .PREVALENCE_BY_MONTH[0]
        )
      "
      :divider="false"
    ></infopanel>
  </v-card>
</template>

<script setup lang="ts">
import Infopanel from "@/widgets/infoPanel";
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { specRecordProportionByMonth } from "./specRecordProportionByMonth";
import * as listeners from "@/pages/model/lib/listeners";
import { specRecordProportionByMonthAnnotation } from "./specRecordProportionByMonthAnnotation";
import { computed } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
const store = useStore();
const route = useRoute();

const notes = computed(() => {
  const sourceName = store.getters.getSelectedSource.cdm_source_key;
  const releaseName = store.getters.getSelectedRelease.release_id;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  const releaseContainer = sourceContainer[releaseName] || {};
  return releaseContainer["viz-deathrecordproportionbymonth"] || [];
});
</script>

<style scoped></style>
