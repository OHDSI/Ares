<template>
  <div v-if="!getErrors">
    <v-container fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-5 d-flex justify-space-between">
          <h2 class="text-uppercase">
            {{ getData.conceptName }} NETWORK REPORT
          </h2>
          <ReturnButton />
        </v-layout>
        <v-row v-if="getData" justify="start"
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-identifier</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="getData.conceptId"
            ></v-badge>
            <p class="text-caption">Concept Identifier</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="getData.numPersons"
            ></v-badge>
            <p class="text-caption">Number of People in Network</p></v-col
          ></v-row
        >
        <v-card
          v-if="getData.measurementValueDistribution"
          :loading="!getData"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title
            >Measurement Value Distributions by Database and Unit</v-card-title
          >
          <v-layout class="pa-4" justify-end>
            <v-select
              v-model="selectedMeasurementUnits"
              class="mr-13"
              :items="getMeasurementUnits"
              attach
              hide-selected
              deletable-chips
              chips
              label="Filter units"
              multiple
            ></v-select>
            <v-btn
              color="primary"
              @click="$refs.measurementvalue.toggleMinMax()"
              ><v-icon dark left>mdi-toggle-switch</v-icon
              >{{ minMaxMode }}</v-btn
            >
          </v-layout>
          <VegaChart
            v-if="getData"
            id="viz-measurementvaluedistribution"
            ref="measurementvalue"
            :config="specMeasurementValueDistribution"
            :data="getSelectedMeasurementUnits"
            min-max
            @minMaxChanged="changeMinMax"
          />
          <info-panel
            details="Learn how
              to interpret this plot."
            route-link="/help"
            :divider="true"
            :link-details="true"
          ></info-panel>
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex.MEASUREMENT.MEASUREMENT_VALUE_DISTRIBUTION[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import ReturnButton from "@/interface/components/ReturnButton";
import { charts } from "@/configs";
import { mapGetters } from "vuex";
import VegaChart from "@/interface/components/VegaChart";
import infoPanel from "@/interface/components/InfoPanel";
export default {
  components: {
    VegaChart,
    ReturnButton,
    infoPanel,
  },
  data() {
    return {
      minMaxMode: "P10/P90",
      selectedMeasurementUnits: [],
      specMeasurementValueDistribution:
        charts.specMeasurementValueDistribution1,
    };
  },
  computed: {
    ...mapGetters(["getData", "getSources", "getErrors", "getQueryIndex"]),
    getSelectedMeasurementUnits: function () {
      return this.selectedMeasurementUnits.length
        ? this.getData.measurementValueDistribution.filter((value) =>
            this.selectedMeasurementUnits.includes(value.CATEGORY)
          )
        : this.getData.measurementValueDistribution;
    },
    getMeasurementUnits: function () {
      return this.getData.measurementValueDistribution.map(
        (value) => value.CATEGORY
      );
    },
  },
  methods: {
    changeMinMax: function (value) {
      this.minMaxMode = value;
    },
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

<style scoped>
.viz-container {
  width: 90%;
}
</style>
