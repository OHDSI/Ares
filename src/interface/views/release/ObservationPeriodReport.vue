<template>
  <div>
    <v-container v-if="!getErrors" fluid>
      <v-responsive min-width="900">
        <div class="text-uppercase text-h6">Observation Period Report</div>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-cumulativeobservation"
            :config="specCumulativeObservation"
            :data="getData.observationPeriodData.CUMULATIVE_DURATION"
            title="Cumulative Observation"
          />
        </v-card>
        <v-card
          v-if="dataInStore"
          :loading="!getData"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Observation Periods per Person</v-card-title>
          <v-data-table
            v-if="dataInStore"
            class="mt-4"
            dense
            :headers="headers"
            :items="getData.personPeriods"
            :footer-props="{
              'items-per-page-options': [5, 10, 25, 50],
            }"
            :items-per-page="5"
            :sort-by="['PERCENT_PEOPLE']"
            :sort-desc="[true, false]"
          >
            <template v-slot:item.PERCENT_PEOPLE="{ item }">
              {{ item.PERCENT_PEOPLE }}%
            </template>
            <template v-slot:item.COUNT_VALUE="{ item }">
              {{ formatComma(item.COUNT_VALUE) }}
            </template>
          </v-data-table>
        </v-card>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-observationbymonth"
            :config="specObservationByMonth"
            :data="getData.observationPeriodData.OBSERVED_BY_MONTH"
            title="Observation over Time"
          />
        </v-card>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-observationbyage"
            :config="specObservationByAge"
            :data="
              getData.observationPeriodData.OBSERVATION_PERIOD_LENGTH_BY_AGE
            "
            title="Years of Observation by Age"
          />
        </v-card>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-observationbysex"
            :config="specObservationBySex"
            :data="
              getData.observationPeriodData.OBSERVATION_PERIOD_LENGTH_BY_GENDER
            "
            title="Years of Observation by Sex"
          />
        </v-card>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-ageatfirstobservation"
            :config="specAgeAtFirstObservation"
            :data="getData.observationPeriodData.AGE_AT_FIRST_OBSERVATION"
            title="Age at First Observation"
          />
        </v-card>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-agebysex"
            :config="specAgeBySex"
            :data="getData.observationPeriodData.AGE_BY_GENDER"
            title="Age at First Observation by Sex"
          />
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import * as d3Format from "d3-format";
import { charts } from "@/configs";
import VegaChart from "@/interface/components/VegaChart";
import { mapGetters } from "vuex";
export default {
  components: {
    VegaChart,
  },
  data() {
    return {
      personPeriods: [],
      observationPeriodData: null,
      headers: [
        {
          text: "Number of Observation Periods",
          sortable: true,
          value: "CONCEPT_ID",
          align: "start",
        },
        {
          text: "Number of People",
          sortable: true,
          value: "COUNT_VALUE",
          align: "start",
        },
        {
          text: "% of People",
          sortable: true,
          value: "PERCENT_PEOPLE",
          align: "end",
        },
      ],
      specAgeAtFirstObservation: charts.specAgeAtFirstObservation,
      specAgeBySex: charts.specAgeBySex,
      specCumulativeObservation: charts.specCumulativeObservation,
      specObservationByAge: charts.specObservationByAge,
      specObservationBySex: charts.specAgeBySex,
      specObservationByMonth: charts.specObservationByMonth,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "dataInStore"]),
  },
  methods: {
    formatComma: function (value) {
      return d3Format.format(",")(value);
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
