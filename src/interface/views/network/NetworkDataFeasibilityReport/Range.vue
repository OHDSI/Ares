<template>
  <v-card elevation="10" class="ma-4 pa-2">
    <v-container fluid>
      <v-card-title>Range Based Requirements</v-card-title>
      <v-row>
        <v-col cols="2">
          <v-label>Age</v-label>
        </v-col>
        <v-col>
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
          </v-range-slider>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="2">
          <v-label>Year</v-label>
        </v-col>
        <v-col>
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

        >
      </v-row>
      <v-row>
        <v-col cols="2">
          <v-label>Cumulative observation range</v-label>
        </v-col>
        <v-col>
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

        >
      </v-row>

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
</template>

<script>
import { timeParse } from "d3-time-format";

export default {
  name: "RangeBased",
  props: {
    data: Array,
  },
  data() {
    return {
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
          value: "cdm_name",
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
          value: "population_observed",
          align: "end",
        },
        {
          text: "Average monthly % population",
          value: "average_population_percentage",
          align: "end",
        },
        {
          text: "Years accounted",
          value: "years_observed",
          align: "end",
        },
      ],
    };
  },
  computed: {
    getObservationRangeDataPerDatasource: function () {
      const timeparse = timeParse("%Y%m");
      return this.data
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
          cdm_name: source.source,
          population_observed: (
            Object.values(source.data).reduce(
              (prevValue, current) => prevValue + current.population / 12,
              0
            ) / Object.keys(source.data).length
          ).toFixed(2),
          average_population_percentage:
            Object.values(source.data).reduce(
              (prevValue, current) => prevValue + current.percent / 12,
              0
            ) / Object.keys(source.data).length,
          years_observed: Object.keys(source.data).length,
          cumulativeDuration:
            source.cumulativeDuration.reduce(
              (prevValue, current) => prevValue + current.PERCENT_PEOPLE,
              0
            ) / Object.keys(source.cumulativeDuration).length,
        }));
    },
  },
  watch: {
    getObservationRangeDataPerDatasource: function () {
      this.$emit("rangeDataChanged", this.getObservationRangeDataPerDatasource);
    },
  },
};
</script>

<style scoped></style>
