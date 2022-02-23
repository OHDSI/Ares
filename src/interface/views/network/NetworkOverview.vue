<template>
  <div id="network-data-quality-overview" class="pa-4">
    <v-row>
      <v-col>
        <v-card elevation="10" class="mx-auto pb-6" outlined>
          <v-card-title>Data Network Overview</v-card-title>
          <v-card-text>
            <v-container fluid>
              <v-row justify="space-around"
                ><v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text--center">Data Sources</h3>
                  <h1 class="text-center">
                    {{ countDataSources
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-database</v-icon
                    >
                  </h1>
                </v-col>
                <v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text-center">People</h3>
                  <h1 class="text-center">
                    {{ personCountFormatter(countPeople)
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-account</v-icon
                    >
                  </h1>
                </v-col>
                <v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text-center">Data Quality Issues</h3>
                  <h1 class="text-center">
                    {{ countDataQualityIssues
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-database-alert</v-icon
                    >
                  </h1>
                </v-col>
                <v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text-center">Data Source Releases</h3>
                  <h1 class="text-center">
                    {{ countDataSourceReleases
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-history</v-icon
                    >
                  </h1>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card elevation="10" class="mx-auto pb-6" outlined>
          <v-card-title>Data Sources</v-card-title>
          <v-card-text>
            <v-data-table
              dense
              :items="dataSourceRecords"
              :headers="dataSourceColumns"
              :items-per-page="-1"
              hide-default-footer
            >
              <template v-slot:item="{ item }">
                <tr>
                  <td>
                    <router-link
                      :to="getDataSourceRoute(item)"
                      :title="item.cdm_source_name"
                      >{{ item.cdm_source_abbreviation }}
                    </router-link>
                  </td>
                  <td class="text-end">
                    {{ formatComma(item.releases[0].count_person) }}
                  </td>
                  <td class="text-start">
                    {{ item.releases[0].obs_period_start }}
                  </td>
                  <td class="text-start">
                    {{ item.releases[0].obs_period_end }}
                  </td>
                  <td class="text-end">{{ item.releases[0].release_name }}</td>
                  <td class="text-end">
                    {{ item.releases[0].count_data_quality_issues }}
                  </td>
                  <td class="text-end">{{ item.count_releases }}</td>
                  <td class="text-end">
                    {{ item.releases[0].vocabulary_version }}
                  </td>
                  <td class="text-end">
                    {{ item.average_update_interval_days }}
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import * as d3 from "d3-format";
import { mapGetters } from "vuex";

export default {
  name: "NetworkOverview",
  components: {},
  data() {
    return {
      indexAvailable: true,
      countDataSources: 0,
      countPeople: 0,
      countDataQualityIssues: 0,
      countDataSourceReleases: 0,
      sources: [],
      dataSourceRecords: [],
      dataSourceColumns: [
        {
          text: "Data Source",
          align: "start",
          sortable: true,
          value: "cdm_source_name"
        },
        {
          text: "Person Count",
          align: "end",
          sortable: true,
          value: "releases[0].count_person"
        },
        {
          text: "Start Observed",
          align: "start",
          value: "obs_period_end",
          sortable: false
        },
        {
          text: "End Observed",
          align: "start",
          value: "obs_period_end",
          sortable: false
        },
        {
          text: "Latest Release",
          align: "end",
          sortable: false,
          value: "releases[0].release_name"
        },
        {
          text: "Data Quality Issues",
          align: "end",
          sortable: true,
          value: "releases[0].count_data_quality_issues"
        },
        {
          text: "Data Source Releases",
          align: "end",
          sortable: true,
          value: "count_releases"
        },
        {
          text: "Vocabulary Version",
          align: "end",
          sortable: true,
          value: "releases[0].vocabulary_version"
        },
        {
          text: "Update Frequency (days)",
          align: "end",
          sortable: true,
          value: "average_update_interval_days"
        }
      ]
    };
  },
  created() {
    console.log("Overview");
    const sources = this.getSources;
    this.countDataSources = sources.length;
    sources.forEach(source => {
      this.countPeople += source.releases[0].count_person;
      this.countDataQualityIssues +=
        source.releases[0].count_data_quality_issues;
      this.countDataSourceReleases += source.releases.length;
      this.dataSourceRecords.push(source);
    });

    /*   .catch((error) => {
        this.indexAvailable = false;
        this.errorText = "data network index not found";
        this.errorDetails = error;
      });*/
  },
  methods: {
    getDataSourceRoute(item) {
      return "/datasource/" + item.cdm_source_key;
    },
    personCountFormatter: function(count) {
      return d3.format(".3s")(count);
    },
    formatComma: function(value) {
      return d3.format(",")(value);
    },
    displayPersonReport: function(source) {
      this.$router.push({
        path:
          "/cdm/" +
          source.cdm_source_key +
          "/" +
          source.releases[0].release_id +
          "/person"
      });
    },
    navigateToDataSourceHistory(datasource) {
      this.$router.push({
        path:
          "/datasource/" + datasource.cdm_source_key + "/data_quality_history"
      });
    },
    displayDetails: function(source) {
      this.$router.push({
        path:
          "/cdm/" +
          source.cdm_source_key +
          "/" +
          source.releases[0].release_id +
          "/data_quality"
      });
    }
  },
  computed: {
    ...mapGetters(["getSources"])
  }
};
</script>

<style scoped>
.v-card__title {
  word-break: normal;
}
.v-card__subtitle {
  padding-bottom: 0px;
  padding-top: 4px;
}
.row {
  margin-top: -5px;
}
</style>
