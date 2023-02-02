<template>
  <div v-if="!store.getters.getErrors">
    <v-container fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-6 text-uppercase text-h6"
          >NETWORK POPULATION OVERVIEW</v-layout
        >
        <v-card
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-ageatfirstobservation"
            :config="chartConfigs.specAgeAtFirstObservation"
            :data="store.getters.getData.allAgeAtFirstObservationData"
            title="Age at First Observation"
          />
          <InfoPanel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .AGE_AT_FIRST_OBSERVATION[0]
              )
            "
            :divider="true"
          ></InfoPanel>
        </v-card>
        <v-card
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-cumulativeobservation"
            :config="chartConfigs.specCumulativeObservation"
            :data="store.getters.getData.allCumulativeDurationData"
            title="Cumulative Observation"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .CUMULATIVE_DURATION[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { chartConfigs, Chart } from "@/widgets/chart";
import { useStore } from "vuex";
import { links } from "@/shared/config/links";
import InfoPanel from "@/widgets/infoPanel/ui/InfoPanel.vue";

const store = useStore();
</script>

<style scoped></style>
