<template>
  <v-card
    v-if="store.getters.getData.conceptData.QUANTITY_DISTRIBUTION"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <ChartHeader title="Quantity" />

    <Chart
      v-if="store.getters.dataInStore"
      id="viz-quantity"
      :chartSpec="specQuantity"
      :data="store.getters.getData.conceptData.QUANTITY_DISTRIBUTION"
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
            .QUANTITY_DISTRIBUTION[0]
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
import { specQuantity } from "./specQuantity";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
