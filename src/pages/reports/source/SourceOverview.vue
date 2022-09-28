<template>
  <div v-if="explorerLoaded" id="network-data-quality-overview" class="pa-4">
    <v-row>
      <v-col>
        <v-card elevation="10" class="mx-auto pb-6" outlined>
          <v-card-title>Source Overview</v-card-title>
          <v-card-text>
            <v-container fluid>
              <v-row justify="space-around"
                ><v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text--center">Releases</h3>
                  <h1 class="text-center">
                    {{ getReleasesCount
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-history</v-icon
                    >
                  </h1>
                </v-col>
                <v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text-center">
                    Average Days Between Releases
                  </h3>
                  <h1 class="text-center">
                    {{ getDaysBetweenReleases.toFixed(0)
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-clock-outline</v-icon
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
          <Chart
            id="population_releases"
            title="Population History"
            :config="specPopulationByRelease"
            :data="getSelectedSource.releases"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="getSqlQueryLink(getQueryIndex.CDM_SOURCE[0])"
            :divider="true"
          ></info-panel>
        </v-card>
      </v-col>
      <v-col>
        <v-card elevation="10" class="mx-auto pb-6" outlined>
          <Chart
            id="issues_releases"
            title="Data Quality Issues History"
            :config="specIssuesByRelease"
            :data="getSelectedSource.releases"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="getSqlQueryLink(getQueryIndex.CDM_SOURCE[0])"
            :divider="true"
          ></info-panel>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card elevation="10" class="mx-auto pb-6" outlined>
          <v-card-title>Release Listing</v-card-title>
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
                  >{{ formatComma(item.count_person) }}</router-link
                >
              </template>
              <template v-slot:item.count_data_quality_issues="{ item }">
                <router-link :to="getQualityLink(item)">{{
                  formatComma(item.count_data_quality_issues)
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
import { chartConfigs, Chart } from "@/widgets/chart";
import infoPanel from "@/widgets/infoPanel";
import { mixins } from "@/shared/lib/mixins";
import { getLinks } from "@/shared/config/links";

export default {
  name: "SourceOverview",
  components: { Chart, infoPanel },
  mixins: [mixins, getLinks],
  data() {
    return {
      specPopulationByRelease: chartConfigs.specPopulationByRelease,
      specIssuesByRelease: chartConfigs.specIssuesByRelease,
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
    };
  },
  methods: {
    getQualityLink: function (item) {
      return {
        name: "dataQuality",
        params: {
          cdm: this.getSelectedSource.cdm_source_key,
          release: item.release_id,
        },
        query: { tab: "overview" },
      };
    },
    getPersonLink: function (item) {
      return {
        name: "person",
        params: {
          cdm: this.getSelectedSource.cdm_source_key,
          release: item.release_id,
        },
      };
    },
  },
  computed: {
    ...mapGetters([
      "getErrors",
      "getSelectedSource",
      "getQueryIndex",
      "explorerLoaded",
    ]),
    getReleasesCount: function () {
      if (this.explorerLoaded) {
        return this.getSelectedSource.count_releases;
      } else {
        return [];
      }
    },

    getDaysBetweenReleases: function () {
      if (this.explorerLoaded) {
        const dates = this.getSelectedSource.releases.map(
          (value) => new Date(value.release_name)
        );
        //todo rewrite using array functional methods
        const numbers = [];

        for (let i = 0; i < dates.length - 1; i++) {
          numbers.push((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
        }

        return numbers.length
          ? numbers.reduce((prevValue, current) => prevValue + current, 0) /
              numbers.length
          : 0;
      } else {
        return [];
      }
    },

    getTable: function () {
      if (this.explorerLoaded) {
        return this.getSelectedSource.releases;
      } else {
        return [];
      }
    },
  },
};
</script>

<style scoped></style>
