<template>
  <div v-if="!getErrors">
    <v-container fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-6 text-uppercase text-h6"
          >NETWORK POPULATION OVERVIEW</v-layout
        >
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <Chart
            v-if="dataInStore"
            id="viz-ageatfirstobservation"
            :config="specAgeAtFirstObservation"
            :data="getData.allAgeAtFirstObservationData"
            title="Age at First Observation"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getSqlQueryLink(
                getQueryIndex.OBSERVATION_PERIOD.AGE_AT_FIRST_OBSERVATION[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <Chart
            v-if="dataInStore"
            id="viz-cumulativeobservation"
            :config="specCumulativeObservation"
            :data="getData.allCumulativeDurationData"
            title="Cumulative Observation"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getSqlQueryLink(
                getQueryIndex.OBSERVATION_PERIOD.CUMULATIVE_DURATION[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import { chartConfigs, Chart } from "@/widgets/chart";
import { mapGetters } from "vuex";
import infoPanel from "@/widgets/infoPanel";
import { mixins } from "@/shared/lib/mixins";
import { getLinks } from "@/shared/config/links";

export default {
  components: {
    Chart,
    infoPanel,
  },
  mixins: [mixins, getLinks],
  data() {
    return {
      specAgeAtFirstObservation: chartConfigs.specAgeAtFirstObservationBySource,
      specCumulativeObservation: chartConfigs.specCumulativeObservationBySource,
    };
  },
  computed: {
    ...mapGetters([
      "getData",
      "getSources",
      "getErrors",
      "dataInStore",
      "getQueryIndex",
    ]),
  },
};
</script>

<style scoped></style>
