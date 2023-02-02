<template>
  <div v-if="!store.getters.getErrors">
    <v-card
      :loading="!store.getters.dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <Chart
        v-if="store.getters.dataInStore"
        id="viz-overview"
        width="80"
        title="Domain
      Density"
        :config="chartConfigs.defOverview"
        :data="store.getters.getData.domainDensity"
      />
      <info-panel
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        details="View export query."
        :link-details="true"
        :link="
          links.getSqlQueryLink(
            store.getters.getQueryIndex.DATA_DENSITY
              .DATADENSITY_RECORDS_PER_PERSON[0]
          )
        "
        :divider="true"
      ></info-panel>
    </v-card>
    <v-card
      :loading="!store.getters.dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <Chart
        v-if="store.getters.dataInStore"
        id="viz-recordsperperson"
        width="80"
        title="Domain Records per Person"
        :config="chartConfigs.defRecordsPerPerson"
        :data="store.getters.getData.domainRecords"
      />
      <InfoPanel
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        details="View export query."
        :link-details="true"
        :link="
          links.getSqlQueryLink(
            store.getters.getQueryIndex.DATA_DENSITY.DATADENSITY_TOTAL[0]
          )
        "
        :divider="true"
      ></InfoPanel>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { chartConfigs, Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";

import { useStore } from "vuex";
const store = useStore();
</script>

<style scoped></style>
