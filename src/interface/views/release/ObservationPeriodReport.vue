<template>
  <div>
    <v-container v-if="!getErrors" fluid>
      <v-responsive min-width="900">
        <div class="text-uppercase text-h6">Observation Period Report</div>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-cumulativeobservation"
            :config="specCumulativeObservation"
            :data="observationPeriodData.CUMULATIVE_DURATION"
            title="Cumulative Observation"
          />
        </v-card>
        <v-card
          v-if="dataLoaded"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Observation Periods per Person</v-card-title>
          <v-data-table
            v-if="dataLoaded"
            class="mt-4"
            dense
            :headers="headers"
            :items="personPeriods"
            :footer-props="{
              'items-per-page-options': [5, 10, 25, 50]
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
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-observationbymonth"
            :config="specObservationByMonth"
            :data="observationPeriodData.OBSERVED_BY_MONTH"
            title="Observation over Time"
          />
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-observationbyage"
            :config="specObservationByAge"
            :data="observationPeriodData.OBSERVATION_PERIOD_LENGTH_BY_AGE"
            title="Years of Observation by Age"
          />
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-observationbysex"
            :config="specObservationBySex"
            :data="observationPeriodData.OBSERVATION_PERIOD_LENGTH_BY_GENDER"
            title="Years of Observation by Sex"
          />
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-ageatfirstobservation"
            :config="specAgeAtFirstObservation"
            :data="observationPeriodData.AGE_AT_FIRST_OBSERVATION"
            title="Age at First Observation"
          />
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-agebysex"
            :config="specAgeBySex"
            :data="observationPeriodData.AGE_BY_GENDER"
            title="Age at First Observation by Sex"
          />
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import * as d3 from "d3-time-format";
import * as d3Format from "d3-format";
import { charts } from "@/configs";
import { FETCH_FILES } from "@/data/store/modules/view/actions.type";
import { OBSERVATION_PERIOD } from "@/data/services/getFilePath";
import VegaChart from "@/interface/components/VegaChart";
import { mapGetters } from "vuex";
import getPercentage from "@/services/get-percentage";
import sortByRange from "@/services/range-sort";
export default {
  components: {
    VegaChart
  },
  data() {
    return {
      dataLoaded: false,
      headers: [],
      personPeriods: [],
      observationPeriodData: null,
      headersMap: {
        CONCEPT_ID: {
          text: "Number of Observation Periods",
          sortable: true,
          value: "CONCEPT_ID",
          align: "start"
        },
        COUNT_VALUE: {
          text: "Number of People",
          sortable: true,
          value: "COUNT_VALUE",
          align: "start"
        },
        PERCENT_PEOPLE: {
          text: "% of People",
          sortable: true,
          value: "PERCENT_PEOPLE",
          align: "end"
        }
      },
      specAgeAtFirstObservation: charts.specAgeAtFirstObservation,
      specAgeBySex: charts.specAgeBySex,
      specCumulativeObservation: charts.specCumulativeObservation,
      specObservationByAge: charts.specObservationByAge,
      specObservationBySex: charts.specAgeBySex,
      specObservationByMonth: charts.specObservationByMonth
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors"])
  },
  watch: {
    $route() {
      this.load();
    }
  },
  created() {
    this.load();
  },
  methods: {
    formatComma: function(value) {
      return d3Format.format(",")(value);
    },
    load: function() {
      this.dataLoaded = false;
      this.$store
        .dispatch(FETCH_FILES, {
          files: [{ name: OBSERVATION_PERIOD, required: true }]
        })
        .then(() => {
          if (!this.getErrors) {
            const dateParse = d3.timeParse("%Y%m");
            this.observationPeriodData = this.getData[OBSERVATION_PERIOD];
            this.headers = Object.values(this.headersMap);
            this.personPeriods = this.observationPeriodData.PERSON_PERIODS_DATA.map(
              item => ({
                ...item,
                PERCENT_PEOPLE: getPercentage(
                  item.COUNT_VALUE,
                  this.observationPeriodData.PERSON_PERIODS_DATA
                )
              })
            );
            this.observationPeriodData.OBSERVATION_PERIOD_LENGTH_BY_AGE = sortByRange(
              this.observationPeriodData.OBSERVATION_PERIOD_LENGTH_BY_AGE,
              "ascending",
              "CATEGORY",
              "categoryOrder"
            );
            this.observationPeriodData.OBSERVED_BY_MONTH.forEach(v => {
              v.DATE = dateParse(v.MONTH_YEAR);
            });
            this.dataLoaded = true;
          }
        });
    }
  }
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
