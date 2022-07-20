<template>
  <div v-if="!getErrors">
    <v-container fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-1 text-uppercase text-h6"
          >Data Source Release Comparison
        </v-layout>
        <v-layout class="ma-0 mb-5 d-flex justify-space-between">
          <h2 class="text-uppercase">{{ getData.conceptName }}</h2>
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
        <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="getData"
            id="viz-recordproportionbymonth"
            :config="specRecordProportionByMonth"
            :data="getData.conceptData"
            title="Record Proportion by Month"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .PREVALENCE_BY_MONTH[0]
              )
            "
            :divider="true"
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
      specRecordProportionByMonth: charts.specRecordProportionByMonthByRelease,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "getQueryIndex"]),
  },
  methods: {
    getQueryLink(queryPath) {
      return `https://github.com/OHDSI/Achilles/tree/main/inst/sql/sql_server/${queryPath}`;
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 80%;
}
</style>
