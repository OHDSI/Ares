<template>
  <div v-if="!getErrors">
    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <VegaChart
        v-if="dataLoaded"
        id="viz-overview"
        width="80"
        title="Domain
      Density"
        :config="defOverview"
        :data="domainDensity"
      />
    </v-card>
    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <VegaChart
        v-if="dataLoaded"
        id="viz-recordsperperson"
        width="80"
        title="Domain Records per Person"
        :config="defRecordsPerPerson"
        :data="domainRecords"
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
      dataLoaded: false,
      domainRecords: null,
      domainDensity: null,
      parsedData: [],
      cdmSourceName: "",
      defRecordsPerPerson: charts.defRecordsPerPerson,
      defOverview: charts.defOverview,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors"]),
  },
  watch: {
    $route() {
      this.load();
    },
  },
  created() {
    this.load();
  },
  methods: {
    triggerResize: function () {
      window.dispatchEvent(new Event("resize"));
    },
    load: function () {
      this.dataLoaded = false;
      this.$store
        .dispatch(FETCH_FILES, {
          files: [
            { name: DENSITY_TOTAL, required: true },
            { name: DENSITY_RECORDS_PERSON, required: true },
          ],
        })
        .then(() => {
          if (!this.getErrors) {
            this.domainDensity = d3Import.csvParse(
              this.getData[DENSITY_RECORDS_PERSON]
            );
            this.domainRecords = d3Import.csvParse(this.getData[DENSITY_TOTAL]);
            this.dataLoaded = true;
          }
        });
    },
  },
};
</script>

<style scoped></style>
