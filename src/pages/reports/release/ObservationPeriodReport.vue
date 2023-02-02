<template>
  <div>
    <v-container v-if="!store.getters.getErrors" fluid>
      <v-responsive min-width="900">
        <div class="text-uppercase text-h6">Observation Period Report</div>
        <v-card
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-cumulativeobservation"
            :config="chartConfigs.specCumulativeObservation"
            :data="
              store.getters.getData.observationPeriodData.CUMULATIVE_DURATION
            "
            title="Cumulative Observation"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .CUMULATIVE_DURATION[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card
          v-if="store.getters.dataInStore"
          :loading="!store.getters.getData"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Observation Periods per Person</v-card-title>
          <v-data-table
            v-if="store.getters.dataInStore"
            class="mt-4"
            density="compact"
            :headers="headers"
            :items="store.getters.getData.personPeriods"
            :footer-props="{
              'items-per-page-options': [5, 10, 25, 50],
            }"
            :items-per-page="5"
            :sort-by="['PERCENT_PEOPLE']"
            :sort-desc="[true, false]"
          >
            <template #item.PERCENT_PEOPLE="{ item }">
              {{ item.raw.PERCENT_PEOPLE }}%
            </template>
            <template #item.COUNT_VALUE="{ item }">
              {{ helpers.formatComma(item.raw.COUNT_VALUE) }}
            </template>
          </v-data-table>
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .PERSON_PERIODS_DATA[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card
          :loading="!store.getters.getData"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-observationbymonth"
            width="90"
            :config="chartConfigs.specObservationByMonth"
            :data="
              store.getters.getData.observationPeriodData.OBSERVED_BY_MONTH
            "
            title="Observation over Time"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .OBSERVED_BY_MONTH[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card
          :loading="!store.getters.getData"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-observationbyage"
            :config="chartConfigs.specObservationByAge"
            :data="
              store.getters.getData.observationPeriodData
                .OBSERVATION_PERIOD_LENGTH_BY_AGE
            "
            title="Years of Observation by Age"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .OBSERVATION_PERIOD_LENGTH_BY_AGE[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card
          :loading="!store.getters.getData"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-observationbysex"
            :config="chartConfigs.specObservationBySex"
            :data="
              store.getters.getData.observationPeriodData
                .OBSERVATION_PERIOD_LENGTH_BY_GENDER
            "
            title="Years of Observation by Sex"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .OBSERVATION_PERIOD_LENGTH_BY_GENDER[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card
          :loading="!store.getters.getData"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-ageatfirstobservation"
            :config="chartConfigs.specAgeAtFirstObservation"
            :data="
              store.getters.getData.observationPeriodData
                .AGE_AT_FIRST_OBSERVATION
            "
            title="Age at First Observation"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .AGE_AT_FIRST_OBSERVATION[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card
          :loading="!store.getters.getData"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-agebysex"
            :config="chartConfigs.specAgeBySex"
            :data="store.getters.getData.observationPeriodData.AGE_BY_GENDER"
            title="Age at First Observation by Sex"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD.AGE_BY_GENDER[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { chartConfigs, Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
import { helpers } from "@/shared/lib/mixins";
import { links } from "@/shared/config/links";
import { VDataTable } from "vuetify/labs/VDataTable";

import { useStore } from "vuex";

const store = useStore();
import { ref, Ref } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";

const headers: Ref<DataTableHeader[]> = ref([
  {
    title: "Number of Observation Periods",
    sortable: true,
    key: "CONCEPT_ID",
    align: "start",
  },
  {
    title: "Number of People",
    sortable: true,
    key: "COUNT_VALUE",
    align: "start",
  },
  {
    title: "% of People",
    sortable: true,
    key: "PERCENT_PEOPLE",
    align: "end",
  },
]);
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
