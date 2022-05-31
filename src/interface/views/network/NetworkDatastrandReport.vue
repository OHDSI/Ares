<template>
  <v-container v-if="!getErrors" fluid min-width="900">
    <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
      <v-card-title>Data Strands</v-card-title>
      <div v-if="getData" id="viz-datastrand" class="viz-container"></div>
      <infopanel
        details="Data strands are simple visualizations that describe the composition of
        a data source across the various CDM domain tables. Each individual
        strand shows the percentage of the data source comprised of data from a
        particular domain table. Across the network, the strands can be visually
        compared and contrasted."
      ></infopanel>
    </v-card>
  </v-container>
</template>

<script>
import embed from "vega-embed";
import infopanel from "../../components/InfoPanel.vue";
import * as d3 from "d3-dsv";
import { charts } from "@/configs";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/data/store/modules/view/actions.type";
import { RECORDS_DOMAIN } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
export default {
  components: {
    infopanel,
  },
  data() {
    return {
      specDatastrand: charts.specDatastrand,
    };
  },
  watch: {
    darkMode() {
      this.renderChart();
    },
    getData() {
      if (this.getData) {
        this.specDatastrand.data[0].values = this.getData;
        this.renderChart();
      }
    },
  },
  methods: {
    navigate: function (route) {
      this.$router.push(route);
      // hide tooltip otherwise it persists on navigation
      document.getElementById("vg-tooltip-element").style.display = "none";
    },
    renderChart: function () {
      embed("#viz-datastrand", this.specDatastrand, {
        theme: this.getSettings.darkMode ? "dark" : "",
      }).then((result) => {
        result.view.addSignalListener("selectDomain", (name, value) => {
          const domainKey = value.domain.toLowerCase().replace(" ", "_");
          const routeUrl =
            "/cdm/" +
            value.cdm_source_key +
            "/" +
            value.cdm_release_key +
            "/" +
            domainKey;

          this.navigate(routeUrl);
        });
      });
    },
  },
  computed: {
    ...mapGetters([
      "getData",
      "getSources",
      "getErrors",
      "getSettings",
      "dataInStore",
    ]),
    darkMode: function () {
      return this.getSettings.darkMode;
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 95%;
}
</style>
