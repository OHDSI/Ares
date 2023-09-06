<template>
  <v-card :loading="!store.getters.getData" elevation="10" class="ma-4">
    <ChartHeader title="Age at First Observation by Sex" />
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-agebysex"
      :chartSpec="specAgeBySex"
      :data="store.getters.getData.observationPeriodData.AGE_BY_GENDER"
    />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex.OBSERVATION_PERIOD.AGE_BY_GENDER[0]
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
import { specAgeBySex } from "./specAgeBySex";
import { useStore } from "vuex";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();
</script>

<style scoped></style>
