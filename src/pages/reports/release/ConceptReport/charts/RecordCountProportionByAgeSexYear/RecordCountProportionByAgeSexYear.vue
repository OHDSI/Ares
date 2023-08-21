<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.getData"
      id="viz-recordproportionbyagesexyear"
      width="90"
      :chartSpec="specRecordProportionByAgeSexYear"
      :data="store.getters.getData.conceptData.PREVALENCE_BY_GENDER_AGE_YEAR"
      title="Record Count Proportion by Age, Sex, and Year"
    />
    <info-panel
      details="Proportion of people with at least one record per 1000 people."
    ></info-panel>
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      link-details
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.params.domain.toUpperCase()]
            .PREVALENCE_BY_GENDER_AGE_YEAR[0]
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
import { useStore } from "vuex";
import { useRoute } from "vue-router";

import { specRecordProportionByAgeSexYear } from "./specRecordProportionByAgeSexYear";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
