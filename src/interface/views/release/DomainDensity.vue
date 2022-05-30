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
    </v-card>
  </div>
</template>

<script>
import VegaChart from "@/interface/components/VegaChart";
import * as d3Import from "d3-dsv";
import { charts } from "@/configs";
import { FETCH_FILES } from "@/data/store/modules/view/actions.type";
import {
  DENSITY_RECORDS_PERSON,
  DENSITY_TOTAL,
} from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
export default {
  components: { VegaChart },
  data() {
    return {
      defRecordsPerPerson: charts.defRecordsPerPerson,
      defOverview: charts.defOverview,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "dataInStore"]),
  },
  methods: {},
};
</script>

<style scoped></style>
