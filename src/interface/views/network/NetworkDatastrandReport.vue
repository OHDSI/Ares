<template>
  <v-responsive v-if="!getErrors" min-width="900">
    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Data Strands</v-card-title>
      <div v-if="dataLoaded" id="viz-datastrand" class="viz-container"></div>
      <infopanel
        details="Data strands are simple visualizations that describe the composition of
        a data source across the various CDM domain tables. Each individual
        strand shows the percentage of the data source comprised of data from a
        particular domain table. Across the network, the strands can be visually
        compared and contrasted."
      ></infopanel>
    </v-card>
  </v-responsive>
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
      dataLoaded: false,
      sources: [],
      cdmSourceName: "",
      specDatastrand: charts.specDatastrand,
      domainData: [],
    };
  },
  created() {
    this.load();
  },
  methods: {
    navigate: function (route) {
      this.$router.push(route);
      // hide tooltip otherwise it persists on navigation
      document.getElementById("vg-tooltip-element").style.display = "none";
    },
    load: function () {
      this.$store
        .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
          files: [RECORDS_DOMAIN],
        })
        .then(() => {
          if (!this.getErrors) {
            this.domainData = this.getData[RECORDS_DOMAIN].reduce(
              (prevValue, current) => [
                ...prevValue,
                ...d3.csvParse(current.data).map((value) => ({
                  ...value,
                  cdm_source_key: current.source.cdm_source_key,
                  cdm_release_key: current.source.releases[0].release_id,
                  cdm_source_abbreviation:
                    current.source.cdm_source_abbreviation,
                })),
              ],
              []
            );
            this.specDatastrand.data[0].values = this.domainData;

            //todo switch to using the VChart component

            embed("#viz-datastrand", this.specDatastrand).then((result) => {
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

            this.dataLoaded = true;
          }
        });
    },
  },
  computed: {
    ...mapGetters(["getData", "getSources", "getErrors"]),
  },
};
</script>

<style scoped>
.viz-container {
  width: 95%;
}
</style>
