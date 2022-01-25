<template>
  <v-responsive min-width="900">
    <v-card
      v-if="!getErrors"
      :loading="!dataLoaded"
      elevation="10"
      class="ma-4 pa-2"
    >
      <div v-if="dataLoaded">
        <VegaChart
          id="viz-continuity"
          title="Domain Continuity"
          :config="specOverview"
          :data="getData.sourceHistoryIndex.domainRecords"
        />
        <info-panel
          details="Domain continuity shows the number of records in each domain table for multiple releases of data from a specific vendor or data source. This is NOT the number of records that occur at specific times within a CDM, but a count of the number of records in a release of a data source, graphed over time. This visualization allows one to see how the data is changing across updates for a single data source."
        ></info-panel>
      </div>
    </v-card>
  </v-responsive>
</template>

<script>
import InfoPanel from "../../components/InfoPanel.vue";
import { charts } from "@/configs";
import VegaChart from "@/interface/components/VegaChart";
import { FETCH_DATA } from "@/data/store/modules/view/actions.type";
import { SOURCE_HISTORY_INDEX } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";

export default {
  components: {
    VegaChart,
    InfoPanel,
  },
  data() {
    return {
      dataLoaded: false,
      specOverview: charts.specOverview,
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
    load: function () {
      this.dataLoaded = false;
      this.$store
        .dispatch(FETCH_DATA, {
          files: [{ name: SOURCE_HISTORY_INDEX, required: true }],
        })
        .then(() => {
          if (!this.getErrors) {
            this.dataLoaded = true;
          }
        });
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 80%;
}
</style>
