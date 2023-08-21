<template>
  <v-card
    v-if="store.getters.getData.conceptData.AGE_AT_FIRST_OCCURRENCE"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-ageatfirstoccurrence"
      :chartSpec="specAgeAtFirstOccurrence"
      :data="store.getters.getData.conceptData.AGE_AT_FIRST_OCCURRENCE"
      title="Age at First Occurrence"
    />
    <info-panel
      details="Learn how to interpret this plot"
      :route-link="{ name: 'help' }"
    ></info-panel>
    <info-panel
      details="View export query."
      icon="mdi-code-braces"
      link-details
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.params.domain.toUpperCase()]
            .AGE_AT_FIRST_OCCURRENCE[0]
        )
      "
      divider
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { specAgeAtFirstOccurrence } from "./specAgeAtFirstOccurrence";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
