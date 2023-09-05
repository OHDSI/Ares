<template>
  <v-card
    v-if="store.getters.getData.conceptData.RECORDS_BY_UNIT"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <ChartHeader title="Records by Unit" />

    <Chart
      v-if="store.getters.dataInStore"
      id="viz-recordsbyunit"
      :chartSpec="specRecordsByUnit"
      :data="store.getters.getData.conceptData.RECORDS_BY_UNIT"
    />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      link-details
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.params.domain.toUpperCase()]
            .RECORDS_BY_UNIT[0]
        )
      "
      :divider="true"
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import InfoPanel from "@/widgets/infoPanel";
import { specRecordsByUnit } from "./specRecordsByUnit";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
