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
          <v-card-title>Data Source Listing</v-card-title>
          <v-card-text>
            <v-data-table
              dense
              :items="sourceData"
              :headers="dataSourceColumns"
              :items-per-page="-1"
              hide-default-footer
            >
              <template v-slot:item.releases[0].count_person="{ item }">
                {{ formatComma(item.releases[0].count_person) }}
              </template>
              <template v-slot:item.cdm_source_name="{ item }">
                <router-link
                  :to="getDataSourceRoute(item)"
                  :title="item.cdm_source_name"
                  >{{ item.cdm_source_abbreviation }}
                </router-link>
              </template>
              <template v-slot:item.datesObserved="{ item }">
                {{ item.releases[0].obs_period_start }} to
                {{ item.releases[0].obs_period_end }}
              </template>
              <template v-slot:item.averageDaysBetweenReleases="{ item }">
                {{ item.averageDaysBetweenReleases.toFixed() }}
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
          value: "cdm_source_name",
        },
        {
          text: "Person Count",
          align: "end",
          sortable: true,
          value: "releases[0].count_person",
        },
        {
          text: "Dates Observed",
          align: "start",
          sortable: false,
          value: "datesObserved",
        },
        {
          text: "Latest Release",
          align: "end",
          sortable: true,
          value: "releases[0].release_name",
        },
        {
          text: "Data Quality Issues",
          align: "end",
          sortable: true,
          value: "releases[0].count_data_quality_issues",
        },
        {
          text: "Data Source Releases",
          align: "end",
          sortable: true,
          value: "count_releases",
        },
        {
          text: "Average days between releases",
          align: "end",
          sortable: true,
          value: "averageDaysBetweenReleases",
        },
        {
          text: "Vocabulary Version",
          align: "end",
          sortable: true,
          value: "releases[0].vocabulary_version",
        },
      ],
    };
  },
  created() {
    const sources = this.getSources;
    this.countDataSources = sources.length;
    sources.forEach((source) => {
      this.countPeople += source.releases[0].count_person;
      this.countDataQualityIssues +=
        source.releases[0].count_data_quality_issues;
      this.countDataSourceReleases += source.releases.length;
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
    personCountFormatter: function (count) {
      return d3.format(".3s")(count);
    },
    formatComma: function (value) {
      return d3.format(",")(value);
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
        path:
          "/datasource/" + datasource.cdm_source_key + "/data_quality_history",
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
  computed: {
    ...mapGetters(["getSources"]),
    sourceData: function () {
      const sources = this.getSources.map((source) => ({
        ...source,
        averageDaysBetweenReleases: source.releases
          .map((release) => new Date(release.release_name))
          .map((date, index, array) => {
            if (array[index + 1]) {
              return (date - array[index + 1]) / (1000 * 60 * 60 * 24);
            }
          })
          .filter((value) => value),
      }));
      return sources.map((source) => ({
        ...source,
        averageDaysBetweenReleases:
          source.averageDaysBetweenReleases.length > 0
            ? source.averageDaysBetweenReleases.reduce(
                (prevValue, current) => prevValue + current,
                0
              ) / source.averageDaysBetweenReleases.length
            : 0,
      }));
    },
  },
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
