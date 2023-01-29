<template>
  <v-container fluid>
    <v-container fluid class="mb-4">
      <v-card-subtitle>Age range</v-card-subtitle>
      <v-range-slider
        density="compact"
        step="1"
        v-model="rangeAge"
        :max="getAgeMinMax[1]"
        :min="getAgeMinMax[0]"
        hide-details
        class="align-center"
      >
        <template v-slot:prepend>
          <v-text-field
            v-model="rangeAge[0]"
            hide-details
            single-line
            type="number"
            variant="underlined"
            style="width: 60px"
          ></v-text-field>
        </template>
        <template v-slot:append>
          <v-text-field
            v-model="rangeAge[1]"
            hide-details
            single-line
            type="number"
            style="width: 60px"
            variant="underlined"
          ></v-text-field>
        </template>
      </v-range-slider>
      <v-card-subtitle>Observation year range</v-card-subtitle>
      <v-range-slider
        step="1"
        density="compact"
        v-model="rangeYear"
        :max="getYearsMinMax[1]"
        :min="getYearsMinMax[0]"
        hide-details
        class="align-center"
      >
        <template v-slot:prepend>
          <v-text-field
            v-model="rangeYear[0]"
            class="mt-0 pt-0"
            hide-details
            single-line
            variant="underlined"
            type="number"
            style="width: 60px"
          ></v-text-field>
        </template>
        <template v-slot:append>
          <v-text-field
            v-model="rangeYear[1]"
            class="mt-0 pt-0"
            hide-details
            single-line
            variant="underlined"
            type="number"
            style="width: 60px"
          ></v-text-field>
        </template>
      </v-range-slider>
      <v-card-subtitle>Minimum cumulative observation</v-card-subtitle>
      <v-slider
        step="1"
        v-model="cumulativeObservation[0]"
        :min="getDurationMinMax[0]"
        :max="getDurationMinMax[1]"
        hide-details
        class="align-center"
      >
        <template v-slot:prepend>
          <v-text-field
            v-model="cumulativeObservation[0]"
            class="mt-0 pt-0"
            hide-details
            variant="underlined"
            single-line
            type="number"
            style="width: 60px"
          ></v-text-field>
        </template>
      </v-slider>
    </v-container>
    <v-data-table dense :headers="yearHeaders" :items="getRangeData">
      <template v-slot:item.population_observed="{ item }">{{
        !isNaN(item.raw.population_observed)
          ? formatComma(item.raw.population_observed)
          : "No data"
      }}</template>
      <template v-slot:item.population_age="{ item }">{{
        item.raw.population_age
          ? formatComma(item.raw.population_age)
          : "No data"
      }}</template>
      <template v-slot:item.average_population_percentage="{ item }">{{
        item.raw.average_population_percentage
          ? (item.raw.average_population_percentage * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.cumulative_duration="{ item }">{{
        item.raw.cumulative_duration
          ? (item.raw.cumulative_duration * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.population_age_percent="{ item }">{{
        item.raw.population_age_percent
          ? (item.raw.population_age_percent * 100).toFixed(2)
          : "No data"
      }}</template>
    </v-data-table>
    <v-divider></v-divider>
    <v-alert
      color="message"
      density="compact"
      icon="mdi-help-rhombus"
      prominent
    >
      The cumulative duration column shows the lowest % of all values found in
      the range.
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { timeParse } from "d3-time-format";
import * as d3Format from "d3-format";
import { VDataTable } from "vuetify/labs/VDataTable";
import { computed, ref, watch, defineProps, defineEmits, Ref } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import { ObservationPeriodType } from "@/processes/exploreReports/model/interfaces/files/ObservationPeriodType";
import { PersonData } from "@/processes/exploreReports/model/interfaces/files/Person";
import { MultipleFilesRawInterface } from "@/processes/exploreReports/model/interfaces/MultipleFilesRawInterface";

interface Props {
  observationPeriod: MultipleFilesRawInterface<ObservationPeriodType>[];
  person: MultipleFilesRawInterface<PersonData>[];
}

const props = defineProps<Props>();

const rangeAge: Ref<number[]> = ref([0, 100]);
const rangeYear: Ref<number[]> = ref([1900, 2021]);
const cumulativeObservation: Ref<number[]> = ref([50]);
const yearHeaders: Ref<DataTableHeader[]> = ref([
  {
    title: "Data source",
    align: "start",
    sortable: false,
    key: "cdm_name",
  },
  {
    title: "Population in the Age range",
    key: "population_age",
    align: "end",
  },
  {
    title: "% in the Age range",
    key: "population_age_percent",
    align: "end",
  },
  {
    title: "Cumulative observation %",
    key: "cumulative_duration",
    align: "end",
  },
  {
    title: "Average observed population per month",
    key: "population_observed",
    align: "end",
  },
  {
    title: "Average observed % population per month",
    key: "average_population_percentage",
    align: "end",
  },
  {
    title: "Years observed",
    key: "years_observed",
    align: "end",
  },
]);

const getRangeData = computed(function () {
  const person = props.person;
  const timeparse = timeParse("%Y%m");
  const observationData = props.observationPeriod
    .map((value) => ({
      cdm_name: value.source.cdm_source_abbreviation,
      data: value.data.OBSERVED_BY_MONTH.filter((filtered) => {
        const parsedYear = parseInt(
          timeparse(filtered.MONTH_YEAR).getFullYear()
        );
        return (
          parsedYear >= rangeYear.value[0] && parsedYear <= rangeYear.value[1]
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
        (data) => data.YEARS <= cumulativeObservation.value[0]
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
      cumulative_duration: Math.min(
        ...value.filtered_duration.map((value) => value.PERCENT_PEOPLE)
      ),
    }));
  const personData = person.map((value) => {
    const filteredPopulationCount = value.data.AGE_GENDER_DATA.filter(
      (data) => data.AGE >= rangeAge.value[0] && data.AGE <= rangeAge.value[1]
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
});
const getAgeMinMax = computed(function () {
  const data = props.person.reduce(
    (prevValue, current) => [
      ...prevValue,
      ...current.data.AGE_GENDER_DATA.map((age) => age.AGE),
    ],
    []
  );
  return [Math.ceil(Math.min(...data)), Math.ceil(Math.max(...data))];
});
const getYearsMinMax = computed(function () {
  const timeparse = timeParse("%Y%m");
  const data = props.observationPeriod.reduce(
    (prevValue, current) => [
      ...prevValue,
      ...current.data.OBSERVED_BY_MONTH.map((year) =>
        timeparse(year.MONTH_YEAR).getFullYear()
      ),
    ],
    []
  );
  return [Math.ceil(Math.min(...data)), Math.ceil(Math.max(...data))];
});
const getDurationMinMax = computed(function () {
  const data = props.observationPeriod.reduce(
    (prevValue, current) => [
      ...prevValue,
      ...current.data.CUMULATIVE_DURATION.map((value) => value.YEARS),
    ],
    []
  );

  return [Math.ceil(Math.min(...data)), Math.ceil(Math.max(...data))];
});

const emit = defineEmits(["rangeDataChanged"]);

watch(getRangeData, () => {
  emit("rangeDataChanged", getRangeData.value);
});

const formatComma = function (value) {
  return d3Format.format(",")(value);
};
</script>

<script lang="ts">
export default {
  name: "RangeBased",
};
</script>

<style scoped></style>
