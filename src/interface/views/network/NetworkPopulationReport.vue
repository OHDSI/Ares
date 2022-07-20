<template>
  <div v-if="!getErrors">
    <v-container fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-6 text-uppercase text-h6"
          >NETWORK POPULATION OVERVIEW</v-layout
        >
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <VegaChart
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
              getQueryLink(
                getQueryIndex.OBSERVATION_PERIOD.AGE_AT_FIRST_OBSERVATION[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <VegaChart
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
              getQueryLink(
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
import { charts } from "@/configs";
import { mapGetters } from "vuex";
import VegaChart from "@/interface/components/VegaChart";
import infoPanel from "@/interface/components/InfoPanel";
export default {
  components: {
    VegaChart,
    infoPanel,
  },
  data() {
    return {
      specAgeAtFirstObservation: charts.specAgeAtFirstObservationBySource,
      specCumulativeObservation: charts.specCumulativeObservationBySource,
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
  methods: {
    getQueryLink(queryPath) {
      return `https://github.com/OHDSI/Achilles/tree/main/inst/sql/sql_server/${queryPath}`;
    },
    navigateToDataQuality() {
      this.$router.push({
        path:
          "/cdm/" +
          this.$route.params.cdm +
          "/" +
          this.$route.params.release +
          "/data_quality?tab=results&search=" +
          this.$route.params.concept,
      });
    },
  },
};
</script>

<style scoped></style>
