<template>
  <div v-if="!getErrors" id="network-data-quality-summary" class="pa-2">
    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <VegaChart
        v-if="dataLoaded"
        id="viz-category"
        title="Network Data Quality Issues By Category"
        :data="getData.networkQualitySummary"
        :config="specIssueStratificationByCategory"
      />
    </v-card>
    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <VegaChart
        v-if="dataLoaded"
        id="viz-table"
        title="Network Data Quality Issues by CDM Table"
        :data="getData.networkQualitySummary"
        :config="specIssueStratificationByTable"
      />
    </v-card>
  </div>
</template>

<script>
import { charts } from "@/configs";
import VegaChart from "@/interface/components/VegaChart";
import { FETCH_FILES } from "@/data/store/modules/view/actions.type";
import { NETWORK_QUALITY_SUMMARY } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
export default {
  name: "NetworkDataQualitySummary",
  components: {
    VegaChart,
  },
  props: {},
  data() {
    return {
      dataLoaded: false,
      specIssueStratificationByCategory:
        charts.specIssueStratificationByCategory,
      specIssueStratificationByTable: charts.specIssueStratificationByTable,
    };
  },
  created() {
    this.dataLoaded = false;
    this.$store
      .dispatch(FETCH_FILES, {
        files: [{ name: NETWORK_QUALITY_SUMMARY, required: true }],
      })
      .then(() => {
        if (!this.getErrors) {
          this.dataLoaded = true;
        }
      });
  },
  methods: {
    navigate: function (route) {
      this.$router.push(route);
      // hide tooltip otherwise it persists on navigation
      document.getElementById("vg-tooltip-element").style.display = "none";
    },
  },
  computed: {
    ...mapGetters(["getData", "getErrors"]),
  },
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
