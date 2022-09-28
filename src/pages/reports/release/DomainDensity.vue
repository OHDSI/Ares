<template>
  <div v-if="!getErrors">
    <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
      <Chart
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
          getSqlQueryLink(
            getQueryIndex.DATA_DENSITY.DATADENSITY_RECORDS_PER_PERSON[0]
          )
        "
        :divider="true"
      ></info-panel>
    </v-card>
    <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
      <Chart
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
        :link="getSqlQueryLink(getQueryIndex.DATA_DENSITY.DATADENSITY_TOTAL[0])"
        :divider="true"
      ></info-panel>
    </v-card>
  </div>
</template>

<script>
import { chartConfigs, Chart } from "@/widgets/chart";
import { mapGetters } from "vuex";
import infoPanel from "@/widgets/infoPanel";
import { getLinks } from "@/shared/config/links";

export default {
  components: { Chart, infoPanel },
  mixins: [getLinks],
  data() {
    return {
      defRecordsPerPerson: chartConfigs.defRecordsPerPerson,
      defOverview: chartConfigs.defOverview,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "dataInStore", "getQueryIndex"]),
  },
};
</script>

<style scoped></style>
