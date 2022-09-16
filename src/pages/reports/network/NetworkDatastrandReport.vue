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
      <infopanel
        v-if="getQueryIndex"
        icon="mdi-code-braces"
        details="View export query."
        :link-details="true"
        :link="
          getSqlQueryLink(getQueryIndex.DOMAIN_SUMMARY.RECORDS_BY_DOMAIN[0])
        "
        :divider="false"
      ></infopanel>
    </v-card>
  </v-container>
</template>

<script>
import embed from "vega-embed";
import infopanel from "../../../widgets/infoPanel";
import { chartConfigs } from "@/widgets/chart";
import { mapGetters } from "vuex";
import { mixins } from "@/shared/lib/mixins";
import { getLinks } from "@/shared/config/links";

export default {
  components: {
    infopanel,
  },
  mixins: [mixins, getLinks],
  data() {
    return {
      specDatastrand: chartConfigs.specDatastrand,
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
    renderChart: function () {
      embed("#viz-datastrand", this.specDatastrand, {
        theme: this.getSettings.darkMode ? "dark" : "",
      }).then((result) => {
        result.view.addSignalListener("selectDomain", (name, value) => {
          const domainKey = value.domain.toLowerCase().replace(" ", "_");
          this.navigateTo("domainTable", {
            cdm: value.cdm_source_key,
            release: value.cdm_release_key,
            domain: domainKey,
          });
          document.getElementById("vg-tooltip-element").style.display = "none";
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
      "getQueryIndex",
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
