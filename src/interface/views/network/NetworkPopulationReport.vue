<template>
  <div v-if="!getErrors">
    <v-container>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-6 text-uppercase text-h6"
          >{{ conceptName }} NETWORK POPULATION OVERVIEW</v-layout
        >
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-ageatfirstobservation"
            :config="specAgeAtFirstObservation"
            :data="allAgeAtFirstObservationData"
            title="Age at First Observation"
          />
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-cumulativeobservation"
            :config="specCumulativeObservation"
            :data="allCumulativeDurationData"
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
      sources: [],
      conceptData: null,
      conceptName: "",
      conceptId: 0,
      allAgeAtFirstObservationData: [],
      allCumulativeDurationData: [],
      dataLoaded: false,
      historyRecords: [],
      cdmSourceName: "",
      specAgeAtFirstObservation: charts.specAgeAtFirstObservationBySource,
      specCumulativeObservation: charts.specCumulativeObservationBySource,
    };
  },
  computed: {
    ...mapGetters(["getData", "getSources", "getErrors"]),
  },
  created() {
    this.load();
  },
  methods: {
    formatPercent: function (value) {
      return d3Format.format("0.0%")(value);
    },
    triggerResize: function () {
      window.dispatchEvent(new Event("resize"));
    },
    navigateToDataQuality() {
      this.$router.push({
        path:
          "/cdm/" +
          this.$route.params.cdm +
          "/" +
          this.$route.params.release +
          "/data_quality?tab=results&conceptFailFilter=" +
          this.$route.params.concept,
      });
    },
    load: function () {
      this.dataLoaded = false;
      this.$store
        .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
          files: [OBSERVATION_PERIOD],
        })
        .then(() => {
          if (!this.getErrors) {
            this.getData[OBSERVATION_PERIOD].forEach((r, i) => {
              r.AGE_AT_FIRST_OBSERVATION.forEach((d) => {
                d.DATA_SOURCE_KEY = this.getSources[i].cdm_source_key;
              });
              r.CUMULATIVE_DURATION.forEach((d) => {
                d.DATA_SOURCE_KEY = this.getSources[i].cdm_source_key;
              });
              this.allCumulativeDurationData =
                this.allCumulativeDurationData.concat(r.CUMULATIVE_DURATION);
              this.allAgeAtFirstObservationData =
                this.allAgeAtFirstObservationData.concat(
                  r.AGE_AT_FIRST_OBSERVATION
                );
            });
            this.dataLoaded = true;
          }
        });
    },
  },
};
</script>

<style scoped></style>
