<template>
  <v-card :loading="!store.getters.getData" elevation="10" class="ma-4 pa-2">
    <Chart
      v-if="store.getters.getData"
      id="viz-sourcerecordproportionbymonth"
      :config="specRecordProportionByMonth"
      :data="store.getters.getData.conceptData"
      :annotations-config="specRecordProportionByMonthAnnotation"
      width="99"
      :click-listener="listeners.setRectangleLocationClick"
      :signal-listener="listeners.setSelectionAreaSignal"
      :context-menu-listener="listeners.showNotesEditDialogRightClick"
      :notes="notes"
      annotations
      title="Record Proportion by Month"
    />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.params.domain.toUpperCase()]
            .PREVALENCE_BY_MONTH[0]
        )
      "
      :divider="true"
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { specRecordProportionByMonth } from "./specRecordProportionByMonth";
import { specRecordProportionByMonthAnnotation } from "./specRecordProportionByMonthAnnotation";
import * as listeners from "@/pages/model/lib/listeners";
import { computed } from "vue";
import _ from "lodash";

const store = useStore();
const route = useRoute();
const notes = computed(() => {
  const { cdm, domain, concept } = route.params;
  const path = [cdm, domain, concept].filter(Boolean);
  const selections = _.get(store.getters.getNotes, path.join(".")) || [];

  return selections["viz-sourcerecordproportionbymonth"] || [];
});
</script>

<style scoped></style>
