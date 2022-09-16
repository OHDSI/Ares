<template>
  <div v-if="explorerLoaded" id="network-data-quality-overview" class="pa-4">
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
                    {{ getSources.length
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
              :items="getSources"
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
              <template v-slot:item.obs_period_start="{ item }">
                {{ item.releases[0].obs_period_start }}
              </template>
              <template v-slot:item.obs_period_end="{ item }">
                {{ item.releases[0].obs_period_end }}
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
import { mixins } from "@/shared/lib/mixins";

export default {
  name: "NetworkOverview",
  components: {},
  mixins: [mixins],
  data() {
    return {
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
          text: "Start Observed",
          align: "end",
          value: "obs_period_start",
          sortable: false,
        },
        {
          text: "End Observed",
          align: "end",
          value: "obs_period_end",
          sortable: false,
        },
        {
          text: "Latest Release",
          align: "end",
          sortable: false,
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
          text: "Vocabulary Version",
          align: "end",
          sortable: true,
          value: "releases[0].vocabulary_version",
        },
        {
          text: "Average Update Frequency (days)",
          align: "end",
          sortable: true,
          value: "average_update_interval_days",
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["getSources", "explorerLoaded"]),
    countPeople: function () {
      if (this.explorerLoaded) {
        return this.getSources.reduce(
          (prev, current) => (prev += current.releases[0].count_person),
          0
        );
      } else {
        return [];
      }
    },
    countDataQualityIssues: function () {
      if (this.explorerLoaded) {
        return this.getSources.reduce(
          (prev, current) =>
            (prev += current.releases[0].count_data_quality_issues),
          0
        );
      } else {
        return [];
      }
    },

    countDataSourceReleases: function () {
      if (this.explorerLoaded) {
        return this.getSources.reduce(
          (prev, current) => (prev += current.releases.length),
          0
        );
      } else {
        return [];
      }
    },
  },
  methods: {
    getDataSourceRoute(item) {
      return {
        name: "dataSourceOverview",
        params: { cdm: item.cdm_source_key },
      };
    },
    personCountFormatter: function (count) {
      return d3.format(".3s")(count);
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
