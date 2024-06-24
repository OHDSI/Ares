<template>
  <Panel toggleable header="Range Requirements" fluid>
    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-10">
        <div class="flex flex-col gap-3">
          <h3>Age range</h3>
          <div class="flex flex-row gap-4 items-center">
            <InputText
              style="width: 5rem"
              :inputmode="'numeric'"
              v-model="rangeAge[0]"
            />
            <Slider
              class="flex-grow"
              range
              :step="1"
              :min="getAgeMinMax[0]"
              :max="getAgeMinMax[1]"
              v-model="rangeAge"
            />
            <InputText
              style="width: 5rem"
              :inputmode="'numeric'"
              v-model="rangeAge[1]"
            />
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <h3>Observation year range</h3>
          <div class="flex flex-row gap-4 items-center">
            <InputText
              style="width: 5rem"
              :inputmode="'numeric'"
              v-model="rangeYear[0]"
            />
            <Slider
              class="flex-grow"
              range
              :step="1"
              :min="getYearsMinMax[0]"
              :max="getYearsMinMax[1]"
              v-model="rangeYear"
            />
            <InputText
              style="width: 5rem"
              :inputmode="'numeric'"
              v-model="rangeYear[1]"
            />
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <h3>Minimum continuous observation</h3>

          <div class="flex flex-row gap-4 items-center">
            <InputText
              style="width: 5rem"
              :inputmode="'numeric'"
              v-model="continuousObservation[0]"
            />
            <Slider
              class="flex-grow"
              :step="1"
              :min="getDurationMinMax[0]"
              :max="getDurationMinMax[1]"
              v-model="continuousObservation[0]"
            />
          </div>
        </div>
      </div>
      <DataTable
        removable-sort
        size="small"
        :value="getRangeData"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column header="Data Source" field="cdm_name"></Column>
        <Column
          sortable
          header="Population in the Age range"
          field="population_age"
        >
          <template #body="slotProps">
            {{
              slotProps.data.population_age
                ? formatComma(slotProps.data.population_age)
                : "No data"
            }}
          </template>
        </Column>
        <Column
          sortable
          header="% in the Age range"
          field="population_age_percent"
        >
          <template #body="slotProps">
            {{
              slotProps.data.population_age_percent
                ? (slotProps.data.population_age_percent * 100).toFixed(2)
                : "No data"
            }}
          </template>
        </Column>
        <Column
          sortable
          header="Cumulative observation %"
          field="cumulative_duration"
        >
        </Column>
        <Column
          sortable
          header="Average observed population per month"
          field="population_observed"
        >
          <template #body="slotProps">
            {{
              !isNaN(slotProps.data.population_observed)
                ? formatComma(slotProps.data.population_observed)
                : "No data"
            }}
          </template>
        </Column>
        <Column
          sortable
          header="Average observed % population per month"
          field="average_population_percentage"
        >
          <template #body="slotProps">
            {{
              slotProps.data.average_population_percentage
                ? (slotProps.data.average_population_percentage * 100).toFixed(
                    2
                  )
                : "No data"
            }}
          </template>
        </Column>
        <Column sortable header="Years observed" field="years_observed">
        </Column>
      </DataTable>
    </div>

    <Divider />
    <Message :closable="false" severity="info">
      The continuous duration column shows the lowest % of all values found in
      the range.
    </Message>
  </Panel>
</template>

<script setup lang="ts">
import { timeParse } from "d3-time-format";
import * as d3Format from "d3-format";
import {
  computed,
  ref,
  watch,
  defineProps,
  defineEmits,
  Ref,
  onMounted,
} from "vue";
import { ObservationPeriodType } from "@/processes/exploreReports/model/interfaces/files/ObservationPeriodType";
import { PersonData } from "@/processes/exploreReports/model/interfaces/files/Person";
import { MultipleFilesRawInterface } from "@/processes/exploreReports/model/interfaces/MultipleFilesRawInterface";
import Message from "primevue/message";
import Divider from "primevue/divider";
import Panel from "primevue/panel";
import InputText from "primevue/inputtext";
import Slider from "primevue/slider";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

interface Props {
  observationPeriod: MultipleFilesRawInterface<ObservationPeriodType>[];
  person: MultipleFilesRawInterface<PersonData>[];
}

const props = defineProps<Props>();

const rangeAge: Ref<number[]> = ref([]);
const rangeYear: Ref<number[]> = ref([]);

const continuousObservation: Ref<number[]> = ref([]);

const getFilteredData = (value, rangeYear) => {
  const timeparse = timeParse("%Y%m");
  return value.data.OBSERVED_BY_MONTH.filter((filtered) => {
    const parsedYear = parseInt(timeparse(filtered.MONTH_YEAR).getFullYear());
    return parsedYear >= rangeYear.value[0] && parsedYear <= rangeYear.value[1];
  });
};

const getReducedData = (filteredData) => {
  const timeparse = timeParse("%Y%m");
  return filteredData.reduce((prevObj, current) => {
    const parsedYear = parseInt(timeparse(current.MONTH_YEAR).getFullYear());
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
  }, {});
};

const getObservationData = (value, rangeYear, continuousObservation) => {
  const filteredData = getFilteredData(value, rangeYear);
  const reducedData = getReducedData(filteredData);
  const filteredDuration = value.data.CUMULATIVE_DURATION.filter(
    (data) => data.YEARS <= continuousObservation.value[0]
  );
  return {
    cdm_name: value.source.cdm_source_abbreviation,
    data: reducedData,
    filtered_duration: filteredDuration,
  };
};

const getPersonData = (person, rangeAge) => {
  return person.map((value) => {
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
};

const getRangeData = computed(function () {
  const person = props.person;
  const observationData = props.observationPeriod
    .map((value) => getObservationData(value, rangeYear, continuousObservation))
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
  const personData = getPersonData(person, rangeAge);
  return observationData.map((value) => ({
    ...value,
    ...personData.find((data) => data.cdm_name === value.cdm_name),
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

onMounted(() => {
  rangeAge.value = getAgeMinMax.value;
  rangeYear.value = getYearsMinMax.value;
  continuousObservation.value = [Math.floor(getDurationMinMax.value[1] / 2)];
});
</script>

<script lang="ts">
export default {
  name: "RangeBased",
};
</script>

<style scoped></style>
