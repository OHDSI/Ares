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
        </v-card>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-cumulativeobservation"
            :config="specCumulativeObservation"
            :data="getData.allCumulativeDurationData"
            title="Cumulative Observation"
          />
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import * as d3Format from "d3-format";
import { charts } from "@/configs";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/data/store/modules/view/actions.type";
import { OBSERVATION_PERIOD } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
import VegaChart from "@/interface/components/VegaChart";
export default {
  components: {
    VegaChart,
  },
  data() {
    return {
      specAgeAtFirstObservation: charts.specAgeAtFirstObservationBySource,
      specCumulativeObservation: charts.specCumulativeObservationBySource,
    };
  },
  computed: {
    ...mapGetters(["getData", "getSources", "getErrors", "dataInStore"]),
  },
  methods: {
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
