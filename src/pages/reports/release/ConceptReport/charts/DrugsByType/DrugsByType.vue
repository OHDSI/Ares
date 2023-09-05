<template>
  <v-card
    v-if="store.getters.getData.conceptData.DRUGS_BY_TYPE"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <ChartHeader title="Drugs by Type" />

    <Chart
      v-if="store.getters.dataInStore"
      id="viz-drugsbytype"
      :chartSpec="specDrugsByType"
      :data="store.getters.getData.conceptData.DRUGS_BY_TYPE"
    />
    <info-panel
      details="Learn about Drug types."
      icon="mdi-help-circle"
      link-details
      :link="links.getDocsLink('DRUG_EXPOSURE')"
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
            .DRUGS_BY_TYPE[0]
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
import { specDrugsByType } from "./specDrugsByType";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
