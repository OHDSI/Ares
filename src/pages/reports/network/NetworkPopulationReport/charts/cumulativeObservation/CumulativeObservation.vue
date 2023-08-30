<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <ChartHeader title="Cumulative Observation" />
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-networkcumulativeobservation"
      :chartSpec="specCumulativeObservation"
      :data="store.getters.getData.allCumulativeDurationData"
    />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex.OBSERVATION_PERIOD.CUMULATIVE_DURATION[0]
        )
      "
      :divider="true"
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import InfoPanel from "@/widgets/infoPanel/ui/InfoPanel.vue";
import { specCumulativeObservation } from "./specCumulativeObservation";
import { useStore } from "vuex";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();
</script>

<style scoped></style>
