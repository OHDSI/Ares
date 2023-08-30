<template>
  <v-card
    v-if="store.getters.getData.conceptData.AGE_AT_FIRST_DIAGNOSIS"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <ChartHeader title="Age at First Diagnosis" />
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-ageatfirstdiagnosis"
      :chartSpec="specAgeAtFirstDiagnosis"
      :data="store.getters.getData.conceptData.AGE_AT_FIRST_DIAGNOSIS"
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
            .AGE_AT_FIRST_DIAGNOSIS[0]
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
import { specAgeAtFirstDiagnosis } from "./specAgeAtFirstDiagnosis";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
