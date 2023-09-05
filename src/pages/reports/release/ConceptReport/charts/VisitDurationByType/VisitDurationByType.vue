<template>
  <v-card
    v-if="store.getters.getData.conceptData.VISIT_DURATION_BY_TYPE"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <ChartHeader title="Visit Duration By Type" />

    <Chart
      v-if="store.getters.dataInStore"
      id="viz-visitdurationbytype"
      :chartSpec="specVisitDurationByType"
      :data="store.getters.getData.conceptData.VISIT_DURATION_BY_TYPE"
    />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      link-details
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.params.domain.toUpperCase()]
            .VISIT_DURATION_BY_TYPE[0]
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
import { specVisitDurationByType } from "./specVisitDurationByType";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
