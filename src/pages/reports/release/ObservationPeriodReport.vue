<template>
  <div>
    <v-container v-if="!getErrors" fluid>
      <v-responsive min-width="900">
        <div class="text-uppercase text-h6">Observation Period Report</div>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <Chart
            v-if="dataInStore"
            id="viz-cumulativeobservation"
            :config="specCumulativeObservation"
            :data="getData.observationPeriodData.CUMULATIVE_DURATION"
            title="Cumulative Observation"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getSqlQueryLink(
                getQueryIndex.OBSERVATION_PERIOD.CUMULATIVE_DURATION[0]
              )
            "
            :divider="true"
          ></info-panel>
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
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getSqlQueryLink(
                getQueryIndex.OBSERVATION_PERIOD.PERSON_PERIODS_DATA[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <Chart
            v-if="dataInStore"
            id="viz-observationbymonth"
            :config="specObservationByMonth"
            :data="getData.observationPeriodData.OBSERVED_BY_MONTH"
            title="Observation over Time"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getSqlQueryLink(
                getQueryIndex.OBSERVATION_PERIOD.OBSERVED_BY_MONTH[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <Chart
            v-if="dataInStore"
            id="viz-observationbyage"
            :config="specObservationByAge"
            :data="
              getData.observationPeriodData.OBSERVATION_PERIOD_LENGTH_BY_AGE
            "
            title="Years of Observation by Age"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getSqlQueryLink(
                getQueryIndex.OBSERVATION_PERIOD
                  .OBSERVATION_PERIOD_LENGTH_BY_AGE[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <Chart
            v-if="dataInStore"
            id="viz-observationbysex"
            :config="specObservationBySex"
            :data="
              getData.observationPeriodData.OBSERVATION_PERIOD_LENGTH_BY_GENDER
            "
            title="Years of Observation by Sex"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getSqlQueryLink(
                getQueryIndex.OBSERVATION_PERIOD
                  .OBSERVATION_PERIOD_LENGTH_BY_GENDER[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <Chart
            v-if="dataInStore"
            id="viz-ageatfirstobservation"
            :config="specAgeAtFirstObservation"
            :data="getData.observationPeriodData.AGE_AT_FIRST_OBSERVATION"
            title="Age at First Observation"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getSqlQueryLink(
                getQueryIndex.OBSERVATION_PERIOD.AGE_AT_FIRST_OBSERVATION[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <Chart
            v-if="dataInStore"
            id="viz-agebysex"
            :config="specAgeBySex"
            :data="getData.observationPeriodData.AGE_BY_GENDER"
            title="Age at First Observation by Sex"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getSqlQueryLink(getQueryIndex.OBSERVATION_PERIOD.AGE_BY_GENDER[0])
            "
            :divider="true"
          ></info-panel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import { chartConfigs, Chart } from "@/widgets/chart";
import { mapGetters } from "vuex";
import infoPanel from "@/widgets/infoPanel";
import { mixins } from "@/shared/lib/mixins";
import { getLinks } from "@/shared/config/links";

export default {
  components: {
    Chart,
    infoPanel,
  },
  mixins: [mixins, getLinks],
  data() {
    return {
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
      specAgeAtFirstObservation: chartConfigs.specAgeAtFirstObservation,
      specAgeBySex: chartConfigs.specAgeBySex,
      specCumulativeObservation: chartConfigs.specCumulativeObservation,
      specObservationByAge: chartConfigs.specObservationByAge,
      specObservationBySex: chartConfigs.specAgeBySex,
      specObservationByMonth: chartConfigs.specObservationByMonth,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "dataInStore", "getQueryIndex"]),
  },
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
