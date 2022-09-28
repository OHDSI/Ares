<template>
  <v-responsive min-width="900">
    <v-card
      v-if="!getErrors"
      :loading="!dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <div v-if="dataInStore">
        <Chart
          id="viz-continuity"
          title="Domain Continuity"
          :config="specOverview"
          :data="getData.domainRecords"
          :listener="eventListener"
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
            getSqlQueryLink(getQueryIndex.DOMAIN_SUMMARY.RECORDS_BY_DOMAIN[0])
          "
          :divider="false"
        ></info-panel>
      </div>
    </v-card>
  </v-responsive>
</template>

<script>
import InfoPanel from "../../../widgets/infoPanel";
import { chartConfigs, Chart } from "@/widgets/chart";
import { mapGetters } from "vuex";
import { getLinks } from "@/shared/config/links";
import { mixins } from "@/shared/lib/mixins";
export default {
  components: {
    Chart,
    InfoPanel,
  },
  mixins: [getLinks, mixins],
  data() {
    return {
      specOverview: chartConfigs.specOverview,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "dataInStore", "getQueryIndex"]),
  },
  methods: {
    navigate: function (route) {
      this.$router.push(route);
      // hide tooltip otherwise it persists on navigation
      document.getElementById("vg-tooltip-element").style.display = "none";
    },
    eventListener: function (result, route) {
      return result.view.addEventListener("click", (event, item) => {
        const itemData = item.datum.datum;
        const releaseKey = this.getPaddedDate(
          new Date(itemData.release_date),
          ""
        );
        const routeUrl = {
          name: "domainTable",
          params: {
            cdm: route.params.cdm,
            release: releaseKey,
            domain: itemData.domain.toLowerCase().split(" ").join("_"),
          },
        };
        this.navigate(routeUrl);
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
