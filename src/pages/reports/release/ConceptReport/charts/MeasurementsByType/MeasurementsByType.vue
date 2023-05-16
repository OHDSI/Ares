<template>
  <v-card
    v-if="store.getters.getData.conceptData.MEASUREMENTS_BY_TYPE"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-measurementsbytype"
      :config="specMeasurementsByType"
      :data="store.getters.getData.conceptData.MEASUREMENTS_BY_TYPE"
      title="Measurements by Type"
    />
    <info-panel
      details="Learn about Measurement types."
      icon="mdi-help-circle"
      link-details
      :link="links.getDocsLink('MEASUREMENT')"
      :divider="true"
    ></info-panel>
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      link-details
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.params.domain.toUpperCase()]
            .MEASUREMENTS_BY_TYPE[0]
        )
      "
      divider
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import InfoPanel from "@/widgets/infoPanel";
import { specMeasurementsByType } from "./specMeasurementsByType";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
