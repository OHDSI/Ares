<template>
  <v-responsive min-width="900">
    <v-card elevation="10" class="ma-4 pa-2">
      <v-card-title>Domain Requirements</v-card-title>
      <p>
        <v-container>
          <v-row>
            <v-col cols="1"> </v-col>
            <v-col cols="5">
              <v-switch
                v-model="switchDomains"
                dense
                label="Condition Occurrence"
                color="blue"
                value="condition_occurrence"
                hide-details
                @change="updateBits()"
              ></v-switch>
              <v-switch
                v-model="switchDomains"
                dense
                label="Drug Exposure"
                color="blue"
                value="drug_exposure"
                hide-details
                @change="updateBits()"
              ></v-switch>
              <v-switch
                v-model="switchDomains"
                dense
                label="Device Exposure"
                color="blue"
                value="device_exposure"
                hide-details
                @change="updateBits()"
              ></v-switch>
              <v-switch
                v-model="switchDomains"
                dense
                label="Measurement"
                color="blue"
                value="measurement"
                hide-details
                @change="updateBits()"
              ></v-switch>
              <v-switch
                v-model="switchDomains"
                dense
                label="Death"
                color="blue"
                value="death"
                hide-details
                @change="updateBits()"
              ></v-switch>
              <v-switch
                v-model="switchDomains"
                dense
                label="Procedure Occurrence"
                color="blue"
                value="procedure_occurrence"
                hide-details
                @change="updateBits()"
              ></v-switch>
              <v-switch
                v-model="switchDomains"
                dense
                label="Observation Period"
                color="blue"
                value="observation_period"
                hide-details
                @change="updateBits()"
              ></v-switch>
            </v-col>
            <v-col cols="6">
              <v-data-table
                dense
                :hide-default-footer="true"
                :disable-pagination="true"
                :headers="domainHeaders"
                :items="getDomainsData"
              >
              </v-data-table>
            </v-col>
          </v-row>
        </v-container>
        >
      </p></v-card
    >
    <v-card elevation="10" class="ma-4 pa-2">
      <v-container fluid>
        <v-card-title>Range Based Requirements</v-card-title>
        <v-row
          ><v-col cols="2"><v-label>Age</v-label></v-col
          ><v-col>
            <v-range-slider
              v-model="rangeAge"
              :max="maxAge"
              :min="minAge"
              hide-details
              class="align-center"
            >
              <template v-slot:prepend>
                <v-text-field
                  :value="rangeAge[0]"
                  class="mt-0 pt-0"
                  hide-details
                  single-line
                  type="number"
                  style="width: 60px"
                  @change="$set(rangeAge, 0, $event)"
                ></v-text-field>
              </template>
              <template v-slot:append>
                <v-text-field
                  :value="rangeAge[1]"
                  class="mt-0 pt-0"
                  hide-details
                  single-line
                  type="number"
                  style="width: 60px"
                  @change="$set(rangeAge, 1, $event)"
                ></v-text-field>
              </template>
            </v-range-slider> </v-col
        ></v-row>
        <v-row
          ><v-col cols="2"><v-label>Year</v-label></v-col
          ><v-col>
            <v-range-slider
              v-model="rangeYear"
              :max="maxYear"
              :min="minYear"
              hide-details
              class="align-center"
            >
              <template v-slot:prepend>
                <v-text-field
                  :value="rangeYear[0]"
                  class="mt-0 pt-0"
                  hide-details
                  single-line
                  type="number"
                  style="width: 60px"
                  @change="$set(rangeYear, 0, $event)"
                ></v-text-field>
              </template>
              <template v-slot:append>
                <v-text-field
                  :value="rangeYear[1]"
                  class="mt-0 pt-0"
                  hide-details
                  single-line
                  type="number"
                  style="width: 60px"
                  @change="$set(rangeYear, 1, $event)"
                ></v-text-field>
              </template>
            </v-range-slider>
          </v-col>

          ></v-row
        >
        <v-row
          ><v-col cols="2"
            ><v-label>Cumulative observation range</v-label></v-col
          ><v-col>
            <v-range-slider
              v-model="cumulativeObservation"
              :max="100"
              :min="0"
              hide-details
              class="align-center"
            >
              <template v-slot:prepend>
                <v-text-field
                  :value="cumulativeObservation[0]"
                  class="mt-0 pt-0"
                  hide-details
                  single-line
                  type="number"
                  style="width: 60px"
                  @change="$set(cumulativeObservation, 0, $event)"
                ></v-text-field>
              </template>
              <template v-slot:append>
                <v-text-field
                  :value="cumulativeObservation[1]"
                  class="mt-0 pt-0"
                  hide-details
                  single-line
                  type="number"
                  style="width: 60px"
                  @change="$set(cumulativeObservation, 1, $event)"
                ></v-text-field>
              </template>
            </v-range-slider>
          </v-col>

          ></v-row
        >

        <v-row>
          <v-col>
            <v-data-table
              dense
              :headers="yearHeaders"
              :items="getObservationRangeDataPerDatasource"
            >
            </v-data-table>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
    <v-card elevation="10" class="ma-4" pa-2>
      <Table :switch-domains="switchDomains" />
    </v-card>
    <v-card elevation="10" class="ma-4 pa-2">
      <v-card-title>Data Source Domain Overview</v-card-title>
      <v-container>
        <v-data-table
          dense
          :hide-default-footer="true"
          :disable-pagination="true"
          :headers="headers"
          :items="items"
        >
        </v-data-table>
      </v-container>
    </v-card>
  </v-responsive>
</template>

<script>
import { csvParse } from "d3-dsv";
import { timeParse } from "d3-time-format";

import {
  DENSITY_DOMAIN_PERSON,
  OBSERVATION_PERIOD,
  PERSON,
} from "@/data/services/getFilePath";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/data/store/modules/view/actions.type";
import { mapGetters } from "vuex";
import Table from "@/interface/views/network/NetworkDataFeasibilityReport/ConceptsPicker";

export default {
  name: "NetworkDataFeasibility",
  components: { Table },
  data() {
    return {
      dataLoaded: false,
      sources: [],
      switchDomains: [],
      chosenDomains: [],
      domainData: [],
      observationPeriod: [],
      person: [],
      qualityResults: [],
      defaultDomainData: [],
      domainBits: "0000000",
      minAge: 0,
      maxAge: 100,
      minYear: 1900,
      maxYear: 2021,
      rangeAge: [0, 100],
      rangeYear: [1900, 2021],
      cumulativeObservation: [0, 100],
      yearHeaders: [
        {
          text: "Data source",
          align: "start",
          sortable: false,
          value: "source",
        },
        {
          text: "Population by Age",
          value: "populationAgeCount",
          align: "end",
        },
        {
          text: "% population by Age",
          value: "populationAgePercent",
          align: "end",
        },
        {
          text: "Cumulative duration %",
          value: "cumulativeDuration",
          align: "end",
        },
        {
          text: "Average monthly observation population",
          value: "averagePopulation",
          align: "end",
        },
        {
          text: "Average monthly % population",
          value: "averagePercentage",
          align: "end",
        },
        {
          text: "Years accounted",
          value: "yearsAccounted",
          align: "end",
        },
      ],
      domainHeaders: [
        {
          text: "Data Source",
          align: "start",
          sortable: false,
          value: "cdm_source_abbreviation",
        },
        {
          text: "Person Count",
          value: "COUNT_VALUE",
          align: "end",
        },
        {
          text: "%",
          value: "PERCENT_VALUE",
          align: "end",
        },
      ],
      headers: [
        {
          text: "Data Source",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "Estimated Person Count", align: "end", value: "estimate" },
        { text: "Conditions", align: "end", value: "condition_occurrence" },
        { text: "Drug Exposures", align: "end", value: "drug_exposure" },
        { text: "Procedures", align: "end", value: "procedure_occurrence" },
        { text: "Measurements", align: "end", value: "measurement" },
        { text: "Observations", align: "end", value: "observation" },
      ],
      domainItems: [],
      items: [
        {
          name: "IBM CCAE",
          estimate: "132M",
          condition_occurrence: "42.8%",
          drug_exposure: "38.6%",
          procedure_occurrence: "22.2%",
          measurement: "12.2%",
          observation: "19.3%",
        },
        {
          name: "IBM MDCR",
          estimate: "54M",
          condition_occurrence: "62.8%",
          drug_exposure: "58.6%",
          procedure_occurrence: "33.2%",
          measurement: "19.2%",
          observation: "12.3%",
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["getData"]),
    getObservationRangeDataPerDatasource: function () {
      const timeparse = timeParse("%Y%m");
      return this.observationPeriod
        .map((source) => ({
          source: source.source.cdm_source_abbreviation,
          data: source.data.OBSERVED_BY_MONTH.filter((filtered) => {
            const parsedYear = parseInt(
              timeparse(filtered.MONTH_YEAR).getFullYear()
            );
            return (
              parsedYear >= this.rangeYear[0] && parsedYear <= this.rangeYear[1]
            );
          }).reduce((prevObj, current) => {
            const parsedYear = parseInt(
              timeparse(current.MONTH_YEAR).getFullYear()
            );
            return {
              ...prevObj,
              [parsedYear]: {
                population: prevObj[parsedYear]?.population
                  ? prevObj[parsedYear].population + current.COUNT_VALUE
                  : 0 + current.COUNT_VALUE,
                percent: prevObj[parsedYear]?.percent
                  ? prevObj[parsedYear].percent + current.PERCENT_VALUE
                  : 0 + current.PERCENT_VALUE,
              },
            };
          }, {}),
          cumulativeDuration: source.data.CUMULATIVE_DURATION.filter(
            (filtered) =>
              filtered.YEARS >= this.cumulativeObservation[0] &&
              filtered.YEARS <= this.cumulativeObservation[1]
          ),
        }))
        .map((source) => ({
          source: source.source,
          averagePopulation: (
            Object.values(source.data).reduce(
              (prevValue, current) => prevValue + current.population / 12,
              0
            ) / Object.keys(source.data).length
          ).toFixed(2),
          averagePercentage: (
            (Object.values(source.data).reduce(
              (prevValue, current) => prevValue + current.percent / 12,
              0
            ) /
              Object.keys(source.data).length) *
            100
          ).toFixed(2),
          yearsAccounted: Object.keys(source.data).length,
          cumulativeRaw: source.cumulativeDuration,
          cumulativeDuration: (
            (source.cumulativeDuration.reduce(
              (prevValue, current) => prevValue + current.PERCENT_PEOPLE,
              0
            ) /
              Object.keys(source.cumulativeDuration).length) *
            100
          ).toFixed(2),
        }));
    },
    getDomainsData: function () {
      if (this.domainBits === "0000000") {
        return [];
      } else {
        return this.sources.map((source) => {
          const data = source.data.filter(
            (d) => d.DOMAIN_BITS === this.domainBits
          );
          return {
            cdm_source_abbreviation: source.source,
            PERCENT_VALUE: data[0].PERCENT_VALUE * 100 + "%",
            COUNT_VALUE: data[0].COUNT_VALUE,
            domain_bits: data[0].DOMAIN_BITS,
          };
        });
      }
    },
    /* calculateSourcesChart: function () {},*/
  },
  created() {
    this.load();
  },
  methods: {
    updateBits: function () {
      const timeparse = timeParse("%Y%m");
      this.domainBits = "";
      this.domainBits = this.domainBits.concat(
        this.switchDomains.includes("condition_occurrence") ? "1" : "0",
        this.switchDomains.includes("drug_exposure") ? "1" : "0",
        this.switchDomains.includes("device_exposure") ? "1" : "0",
        this.switchDomains.includes("measurement") ? "1" : "0",
        this.switchDomains.includes("death") ? "1" : "0",
        this.switchDomains.includes("procedure_occurrence") ? "1" : "0",
        this.switchDomains.includes("observation_period") ? "1" : "0"
      );
    },

    load: function () {
      this.$store
        .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
          files: [OBSERVATION_PERIOD, PERSON, DENSITY_DOMAIN_PERSON],
        })
        .then(() => {
          this.observationPeriod = this.getData[OBSERVATION_PERIOD];
          this.person = this.getData[PERSON];
          this.sources = this.getData[DENSITY_DOMAIN_PERSON].map((file) => ({
            data: csvParse(file.data),
            source: file.source.cdm_source_abbreviation,
          }));
        });
    },
    getCountByAgeRange: function (data, range) {},
  },
};
</script>

<style scoped></style>
