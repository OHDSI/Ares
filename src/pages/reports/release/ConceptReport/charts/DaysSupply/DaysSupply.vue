<template>
  <v-card
    v-if="store.getters.getData.conceptData.DAYS_SUPPLY_DISTRIBUTION"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-dayssupply"
      :config="specDaysSupply"
      :data="store.getters.getData.conceptData.DAYS_SUPPLY_DISTRIBUTION"
      title="Days Supply"
    />
    <info-panel
      details="Learn how to interpret this plot"
      :route-link="{ name: 'help' }"
    ></info-panel>
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      link-details
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.params.domain.toUpperCase()]
            .DAYS_SUPPLY_DISTRIBUTION[0]
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
import { specDaysSupply } from "./specDaysSupply";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
