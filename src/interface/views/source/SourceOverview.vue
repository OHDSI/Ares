<template>
  <div id="network-data-quality-overview" class="pa-4">
    <v-row>
      <v-col>
        <v-card elevation="10" class="mx-auto pb-6" outlined>
          <v-card-title>Source overview</v-card-title>
          <v-card-text>
            <v-container fluid>
              <v-row justify="space-around"
                ><v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text--center">Releases</h3>
                  <h1 class="text-center">
                    {{ getReleasesCount
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-database</v-icon
                    >
                  </h1>
                </v-col>
                <v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text-center">
                    Average days between releases
                  </h3>
                  <h1 class="text-center">
                    {{ getDaysBetweenReleases
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-account</v-icon
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
          <VegaChart
            id="population_releases"
            title="Population dynamics"
            :config="specPopulationAcrossReleases"
            :data="getSelectedSource.releases"
          />
        </v-card>
      </v-col>
      <v-col>
        <v-card elevation="10" class="mx-auto pb-6" outlined>
          <VegaChart
            id="issues_releases"
            title="Issues dynamics"
            :config="specIssuesByRelease"
            :data="getSelectedSource.releases"
          />
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card elevation="10" class="mx-auto pb-6" outlined>
          <v-card-title>Releases Listing</v-card-title>
          <v-card-text>
            <v-data-table
              dense
              :items="getTable"
              :headers="overviewTable"
              :items-per-page="-1"
              hide-default-footer
            >
              <template v-slot:item.count_person="{ item }">
                <router-link
                  :to="getPersonLink(item)"
                  :title="item.count_person"
                  >{{ item.count_person }}</router-link
                >
              </template>
              <template v-slot:item.count_data_quality_issues="{ item }">
                <router-link :to="getQualityLink(item)">{{
                  item.count_data_quality_issues
                }}</router-link>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col> </v-row
    >'
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import VegaChart from "@/interface/components/VegaChart";
import { charts } from "@/configs";

export default {
  name: "SourceOverview",
  components: { VegaChart },
  data() {
    return {
      specPopulationAcrossReleases: charts.specPopulationAcrossReleases,
      specIssuesByRelease: charts.specIssuesByRelease,
      overviewTable: [
        {
          text: "Release date",
          align: "start",
          sortable: true,
          value: "release_name",
        },
        {
          text: "Number of people",
          align: "end",
          sortable: true,
          value: "count_person",
        },
        {
          text: "Data quality issues",
          align: "end",
          sortable: true,
          value: "count_data_quality_issues",
        },
      ],
      fill: true,
      gradients: [
        ["#222"],
        ["#42b3f4"],
        ["red", "orange", "yellow"],
        ["purple", "violet"],
        ["#00c6ff", "#F0F", "#FF0"],
        ["#f72047", "#ffd200", "#1feaea"],
      ],
      selectedGradient: ["#00c6ff", "#F0F", "#FF0"],

      padding: 8,
      radius: 10,
      width: 2,
    };
  },
  methods: {
    getQualityLink: function (item) {
      return `/cdm/${this.getSelectedSource.cdm_source_key}/${item.release_id}/data_quality?tab=overview`;
    },
    getPersonLink: function (item) {
      return `/cdm/${this.getSelectedSource.cdm_source_key}/${item.release_id}`;
    },
    getQualityIssuesCount: function (release) {
      return release.count_data_quality_issues;
    },
    getNumberOfPeople: function (release) {
      return release.count_person;
    },
    getDataSourceRoute(item) {
      return "/datasource/" + item.cdm_source_key;
    },
  },
  computed: {
    ...mapGetters(["getErrors", "getSelectedSource"]),
    getReleasesCount: function () {
      return this.getSelectedSource.count_releases;
    },

    getPeopleChart: function () {
      return [];
    },

    getPeopleSparkline: function () {
      return this.getSelectedSource.releases.map((value) => ({
        count: value.count_person,
        date: value,
      }));
    },

    getDaysBetweenReleases: function () {
      const dates = this.getSelectedSource.releases.map(
        (value) => new Date(value.release_name)
      );

      const numbers = [];

      for (let i = 0; i < dates.length - 1; i++) {
        numbers.push((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
      }
      return (
        numbers.reduce((prevValue, current) => prevValue + current, 0) /
        numbers.length
      );
    },

    getTable: function () {
      return this.getSelectedSource.releases;
    },
  },
};
</script>

<style scoped></style>
