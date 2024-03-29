<template>
  <v-container fluid>
    <v-container fluid class="mb-4">
      <v-subheader>Age range</v-subheader>
      <v-range-slider
        v-model="rangeAge"
        :max="getAgeMinMax[1]"
        :min="getAgeMinMax[0]"
        hide-details
        class="align-center"
      >
        <template #prepend>
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
        <template #append>
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
      <v-subheader>Observation year range</v-subheader>
      <v-range-slider
        v-model="rangeYear"
        :max="getYearsMinMax[1]"
        :min="getYearsMinMax[0]"
        hide-details
        class="align-center"
      >
        <template #prepend>
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
        <template #append>
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
      <v-subheader>Minimum continuous observation</v-subheader>
      <v-slider
        v-model="continuousObservation[0]"
        :min="getDurationMinMax[0]"
        :max="getDurationMinMax[1]"
        hide-details
        class="align-center"
      >
        <template #prepend>
          <v-text-field
            :value="continuousObservation[0]"
            class="mt-0 pt-0"
            hide-details
            single-line
            type="number"
            style="width: 60px"
            @change="$set(continuousObservation, 0, $event)"
          ></v-text-field>
        </template>
      </v-slider>
    </v-container>
    <v-data-table dense :headers="yearHeaders" :items="getRangeData">
      <template #item.population_observed="{ item }">{{
        !isNaN(item.population_observed)
          ? formatComma(item.population_observed)
          : "No data"
      }}</template>
      <template #item.population_age="{ item }">{{
        item.population_age ? formatComma(item.population_age) : "No data"
      }}</template>
      <template #item.average_population_percentage="{ item }">{{
        item.average_population_percentage
          ? (item.average_population_percentage * 100).toFixed(2)
          : "No data"
      }}</template>
      <template #item.continuous_duration="{ item }">{{
        item.continuous_duration
          ? (item.continuous_duration * 100).toFixed(2)
          : "No data"
      }}</template>
      <template #item.population_age_percent="{ item }">{{
        item.population_age_percent
          ? (item.population_age_percent * 100).toFixed(2)
          : "No data"
      }}</template>
    </v-data-table>
    <v-divider></v-divider>
    <v-alert color="grey darken-3" dark dense icon="mdi-help-rhombus" prominent>
      The continuous duration column shows the lowest % of all values found in
      the range.
    </v-alert>
  </v-container>
</template>

<script>
import { timeParse } from "d3-time-format";
import * as d3Format from "d3-format";

export default {
  name: "RangeBased",
  props: {
    observationPeriod: Array,
    person: Array,
  },
  data() {
    return {
      minAge: 0,
      maxAge: 100,
      minYear: 1900,
      maxYear: 2021,
      rangeAge: [0, 100],
      rangeYear: [1900, 2021],
      continuousObservation: [50],
      yearHeaders: [
        {
          text: "Data source",
          align: "start",
          sortable: false,
          value: "cdm_name",
        },
        {
          text: "Population in the Age range",
          value: "population_age",
          align: "end",
        },
        {
          text: "% in the Age range",
          value: "population_age_percent",
          align: "end",
        },
        {
          text: "Continuous observation %",
          value: "continuous_duration",
          align: "end",
        },
        {
          text: "Average observed population per month",
          value: "population_observed",
          align: "end",
        },
        {
          text: "Average observed % population per month",
          value: "average_population_percentage",
          align: "end",
        },
        {
          text: "Years observed",
          value: "years_observed",
          align: "end",
        },
      ],
    };
  },
  computed: {
    getRangeData: function () {
      const person = this.person;
      const timeparse = timeParse("%Y%m");
      const observationData = this.observationPeriod
        .map((value) => ({
          cdm_name: value.source.cdm_source_abbreviation,
          data: value.data.OBSERVED_BY_MONTH.filter((filtered) => {
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
          filtered_duration: value.data.CUMULATIVE_DURATION.filter(
            (data) => data.YEARS <= this.continuousObservation[0]
          ),
        }))
        .map((value) => ({
          cdm_name: value.cdm_name,
          population_observed: (
            Object.values(value.data).reduce(
              (prevValue, current) => prevValue + current.population / 12,
              0
            ) / Object.keys(value.data).length
          ).toFixed(2),
          average_population_percentage:
            Object.values(value.data).reduce(
              (prevValue, current) => prevValue + current.percent / 12,
              0
            ) / Object.keys(value.data).length,
          years_observed: Object.keys(value.data).length,
          continuous_duration: Math.min(
            ...value.filtered_duration.map((value) => value.PERCENT_PEOPLE)
          ),
        }));
      const personData = person.map((value) => {
        const filteredPopulationCount = value.data.AGE_GENDER_DATA.filter(
          (data) => data.AGE >= this.rangeAge[0] && data.AGE <= this.rangeAge[1]
        ).reduce((prevValue, current) => prevValue + current.COUNT_VALUE, 0);
        return {
          cdm_name: value.source.cdm_source_abbreviation,
          population_age: filteredPopulationCount,
          population_age_percent:
            filteredPopulationCount / value.data.SUMMARY[1].ATTRIBUTE_VALUE,
        };
      });
      return observationData.map((value) => ({
        ...value,
        ...personData.filter((data) => data.cdm_name === value.cdm_name)[0],
      }));
    },
    getAgeMinMax: function () {
      const data = this.person.reduce(
        (prevValue, current) => [
          ...prevValue,
          ...current.data.AGE_GENDER_DATA.map((age) => age.AGE),
        ],
        []
      );
      return [Math.ceil(Math.min(...data)), Math.ceil(Math.max(...data))];
    },
    getYearsMinMax: function () {
      const timeparse = timeParse("%Y%m");
      const data = this.observationPeriod.reduce(
        (prevValue, current) => [
          ...prevValue,
          ...current.data.OBSERVED_BY_MONTH.map((year) =>
            timeparse(year.MONTH_YEAR).getFullYear()
          ),
        ],
        []
      );
      return [Math.ceil(Math.min(...data)), Math.ceil(Math.max(...data))];
    },

    getDurationMinMax: function () {
      const data = this.observationPeriod.reduce(
        (prevValue, current) => [
          ...prevValue,
          ...current.data.CUMULATIVE_DURATION.map((value) => value.YEARS),
        ],
        []
      );

      return [Math.ceil(Math.min(...data)), Math.ceil(Math.max(...data))];
    },
  },
  watch: {
    getRangeData: function () {
      this.$emit("rangeDataChanged", this.getRangeData);
    },
  },
  methods: {
    formatComma: function (value) {
      return d3Format.format(",")(value);
    },
  },
};
</script>

<style scoped></style>
