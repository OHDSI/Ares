<template>
  <v-card :loading="!store.getters.getData" elevation="10" class="ma-4 pa-2">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-observationbysex"
      :config="specObservationBySex"
      :data="
        store.getters.getData.observationPeriodData
          .OBSERVATION_PERIOD_LENGTH_BY_GENDER
      "
      title="Years of Observation by Sex"
    />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex.OBSERVATION_PERIOD
            .OBSERVATION_PERIOD_LENGTH_BY_GENDER[0]
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
import { specObservationBySex } from "./specObservationBySex";
import { useStore } from "vuex";

const store = useStore();
</script>

<style scoped></style>
