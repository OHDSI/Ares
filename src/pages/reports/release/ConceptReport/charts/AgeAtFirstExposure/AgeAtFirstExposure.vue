<template>
  <v-card
    v-if="store.getters.getData.conceptData.AGE_AT_FIRST_EXPOSURE"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <ChartHeader title="Age At First Exposure" />

    <Chart
      v-if="store.getters.dataInStore"
      id="viz-ageatfirstexposure"
      :chartSpec="specAgeAtFirstExposure"
      :data="store.getters.getData.conceptData.AGE_AT_FIRST_EXPOSURE"
    />
    <info-panel
      details="Learn how
              to interpret this plot."
      icon="mdi-help-circle"
      link-details
      :route-link="{ name: 'help' }"
      divider
    ></info-panel>
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      link-details
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.params.domain.toUpperCase()]
            .AGE_AT_FIRST_EXPOSURE[0]
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
import { specAgeAtFirstExposure } from "./specAgeAtFirstExposure";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
