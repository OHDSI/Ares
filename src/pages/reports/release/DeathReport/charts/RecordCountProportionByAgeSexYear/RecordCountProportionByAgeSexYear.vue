<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-recordproportionbyagesexyear"
      width="90"
      :config="specRecordProportionByAgeSexYear"
      :data="store.getters.getData.PREVALENCE_BY_GENDER_AGE_YEAR"
      title="Record Count Proportion by Age, Sex, and Year"
    />
    <infopanel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.name.toUpperCase()]
            .PREVALENCE_BY_GENDER_AGE_YEAR[0]
        )
      "
      :divider="true"
    ></infopanel>
  </v-card>
</template>

<script setup lang="ts">
import Infopanel from "@/widgets/infoPanel";
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { specRecordProportionByAgeSexYear } from "./specRecordProportionByAgeSexYear";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
