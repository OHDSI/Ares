<template>
  <div v-if="!getErrors">
    <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
      <VegaChart
        v-if="dataInStore"
        id="viz-overview"
        width="80"
        title="Domain
      Density"
        :config="defOverview"
        :data="getData.domainDensity"
      />
      <info-panel
        v-if="getQueryIndex"
        icon="mdi-code-braces"
        details="View export query."
        :link-details="true"
        :link="
          getQueryLink(
            getQueryIndex.DATA_DENSITY.DATADENSITY_RECORDS_PER_PERSON[0]
          )
        "
        :divider="true"
      ></info-panel>
    </v-card>
    <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
      <VegaChart
        v-if="dataInStore"
        id="viz-recordsperperson"
        width="80"
        title="Domain Records per Person"
        :config="defRecordsPerPerson"
        :data="getData.domainRecords"
      />
      <info-panel
        v-if="getQueryIndex"
        icon="mdi-code-braces"
        details="View export query."
        :link-details="true"
        :link="getQueryLink(getQueryIndex.DATA_DENSITY.DATADENSITY_TOTAL[0])"
        :divider="true"
      ></info-panel>
    </v-card>
  </div>
</template>

<script>
import VegaChart from "@/interface/components/VegaChart";
import { charts } from "@/configs";
import { mapGetters } from "vuex";
import infoPanel from "@/interface/components/InfoPanel";
export default {
  components: { VegaChart, infoPanel },
  data() {
    return {
      defRecordsPerPerson: charts.defRecordsPerPerson,
      defOverview: charts.defOverview,
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

<style scoped></style>
