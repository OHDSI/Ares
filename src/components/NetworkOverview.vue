<template>
  <div id="network-data-quality-overview" class="pa-4">
    <error
      v-if="!indexAvailable"
      :text="errorText"
      :details="errorDetails"
    ></error>
    <v-row>
      <template v-for="(result, index) in sources">
        <div class="col-12" :key="index">
          <v-card elevation="10" class="mx-auto pb-6" outlined>
            <v-card-title>{{ result.cdm_source_abbreviation }}</v-card-title>
            <v-card-subtitle>{{ result.cdm_source_name }}</v-card-subtitle>
            <v-card-date class="v-card_date">Observation period:  {{ result.releases[0].obs_period_start }} to {{ result.releases[0].obs_period_end }}</v-card-date>
            <v-row justify="space-around">
              <v-col cols="auto" class="ma-2 pa-1" align="center">
                <v-btn
                  @click="displayPersonReport(result)"
                  fab
                  dark
                  color="success"
                  class="ma-2"
                  small
                  ><v-icon>mdi-account-group</v-icon>
                </v-btn>
                <p class="text-subtitle ma-0">
                  {{ personCountFormatter(result.releases[0].count_person) }}
                </p>
                <p class="text-caption ma-0">Total People</p>
              </v-col>
              <v-col cols="auto" class="ma-2 pa-1" align="center">
                <v-btn
                  @click="displayDetails(result)"
                  fab
                  dark
                  color="error"
                  class="ma-2"
                  small
                  ><v-icon>mdi-database-alert</v-icon>
                </v-btn>
                <p class="text-subtitle ma-0">
                  {{ result.releases[0].count_data_quality_issues }}
                </p>
                <p class="text-caption ma-0">Data Quality Issues</p>
              </v-col>
              <v-col cols="auto" class="ma-2 pa-1" align="center">
                <v-btn
                  @click="displayDetails(result)"
                  small
                  fab
                  dark
                  class="ma-2"
                  ><v-icon>mdi-tag-outline</v-icon>
                </v-btn>
                <p class="text-subtitle ma-0">
                  {{ result.releases[0].release_name }}
                </p>
                <p class="text-caption ma-0">Latest Release</p>
              </v-col>
              <v-col cols="auto" class="ma-2 pa-1" align="center">
                <v-btn
                  @click="navigateToDataSourceHistory(result)"
                  fab
                  dark
                  color="info"
                  class="ma-2"
                  small
                  ><v-icon>mdi-history</v-icon>
                </v-btn>
                <p class="text-subtitle ma-0">
                  {{ result.count_releases }}
                </p>
                <p class="text-caption ma-0">Data Releases</p>
              </v-col>
              <v-col cols="auto" class="ma-2 pa-1" align="center">
                <v-btn fab dark color="warning" class="ma-2" small
                  ><v-icon>mdi-translate</v-icon>
                </v-btn>
                <p class="text-subtitle ma-0">
                  {{ result.releases[0].vocabulary_version }}
                </p>
                <p class="text-caption ma-0">Vocabulary Version</p>
              </v-col>
            </v-row>
          </v-card>
        </div>
      </template>
    </v-row>
    <infopanel
      details="The overview lists all data sources currently available in the network.  Clicking the buttons allows exploration of different aspects of each data source."
    ></infopanel>
  </div>
</template>

<script>
import axios from "axios";
import error from "./Error.vue";
import infopanel from "./InfoPanel.vue";
import * as d3 from "d3-format";

export default {
  name: "NetworkOverview",
  data() {
    return {
      indexAvailable: true,
      errorText: "",
      errorDetails: "",
      sources: [],
    };
  },
  created() {
    axios
      .get("data/index.json")
      .then((response) => {
        this.sources = response.data.sources;
      })
      .catch((error) => {
        this.indexAvailable = false;
        this.errorText = "data network index not found";
        this.errorDetails = error;
      });
  },
  components: {
    error,
    infopanel,
  },
  methods: {
    personCountFormatter: function (count) {
      return d3.format(".3s")(count);
    },
    displayPersonReport: function (source) {
      this.$router.push({
        path:
          "/cdm/" +
          source.cdm_source_key +
          "/" +
          source.releases[0].release_id +
          "/person",
      });
    },
    navigateToDataSourceHistory(datasource) {
      this.$router.push({
        path: "/datasource/" + datasource.cdm_source_key + "/data_quality_history",
      });
    },
    displayDetails: function (source) {
      this.$router.push({
        path:
          "/cdm/" +
          source.cdm_source_key +
          "/" +
          source.releases[0].release_id +
          "/data_quality",
      });
    },
  },
};
</script>

<style scoped>
.v-card__title {
  word-break: normal;
}
.v-card_date {
  word-break: normal;
  padding:0px 0px 16px 16px;
  margin-top: 0%;
  color: rgba(0,0,0,.6);
}
.v-card__subtitle {
  padding-bottom:0px;
}
.row {
  margin-top:-5px;
}
</style>
