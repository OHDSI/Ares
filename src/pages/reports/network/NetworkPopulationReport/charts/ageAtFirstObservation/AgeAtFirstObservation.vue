<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-networkageatfirstobservation"
      :config="specAgeAtFirstObservation"
      :data="store.getters.getData.allAgeAtFirstObservationData"
      title="Age at First Observation"
    />
    <InfoPanel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex.OBSERVATION_PERIOD
            .AGE_AT_FIRST_OBSERVATION[0]
        )
      "
      :divider="true"
    ></InfoPanel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel/ui/InfoPanel.vue";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";

import { specAgeAtFirstObservation } from "./specAgeAtFirstObservation";

const store = useStore();
</script>

<style scoped></style>
