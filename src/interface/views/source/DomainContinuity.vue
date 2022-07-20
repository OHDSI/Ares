<template>
  <v-responsive min-width="900">
    <v-card
      v-if="!getErrors"
      :loading="!dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <div v-if="dataInStore">
        <VegaChart
          id="viz-continuity"
          title="Domain Continuity"
          :config="specOverview"
          :data="getData.domainRecords"
        />
        <info-panel
          details="Domain continuity shows the number of records in each domain table for multiple releases of data from a specific vendor or data source. This is NOT the number of records that occur at specific times within a CDM, but a count of the number of records in a release of a data source, graphed over time. This visualization allows one to see how the data is changing across updates for a single data source."
        ></info-panel>
        <info-panel
          v-if="getQueryIndex"
          icon="mdi-code-braces"
          details="View export query."
          :link-details="true"
          :link="
            getQueryLink(getQueryIndex.DOMAIN_SUMMARY.RECORDS_BY_DOMAIN[0])
          "
          :divider="false"
        ></info-panel>
      </div>
    </v-card>
  </v-responsive>
</template>

<script>
import InfoPanel from "../../components/InfoPanel.vue";
import { charts } from "@/configs";
import VegaChart from "@/interface/components/VegaChart";
import { mapGetters } from "vuex";

export default {
  components: {
    VegaChart,
    InfoPanel,
  },
  data() {
    return {
      specOverview: charts.specOverview,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "dataInStore", "getQueryIndex"]),
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
