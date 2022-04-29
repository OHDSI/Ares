<template>
  <div v-if="!getErrors">
    <v-container fluid class="pa-1">
      <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
        <v-row
          ><v-col cols="8">
            <v-layout justify-start align-center class="ml-4 mr-4">
              <v-card-title>{{
                this.$route.params.domain.toUpperCase().replace("_", " ")
              }}</v-card-title>
            </v-layout>
          </v-col>
          <v-col cols="4">
            <v-layout justify-end align-center class="ml-4 mr-4">
              <v-tooltip
                v-if="issueDataLoaded & (issueCount > 0)"
                left
                nudge-left="15"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon tile @click="navigateToDataQuality()"
                    ><v-icon left v-bind="attrs" large color="error" v-on="on"
                      >mdi-database-alert</v-icon
                    >
                    <v-badge
                      tile
                      inline
                      dark
                      color="error"
                      :content="issueCount"
                    ></v-badge>
                  </v-btn>
                </template>
                <span
                  >Data quality issues were identified for this domain.
                </span>
              </v-tooltip>
            </v-layout>
          </v-col>
        </v-row>
        <v-container fluid>
          <v-row>
            <v-col>
              <v-text-field
                prepend-icon="mdi-magnify"
                label="Search in Table"
                single-line
                hide-details
                @input="delayedSearch"
              ></v-text-field>
            </v-col>
            <v-col>
              <v-menu
                v-model="chooseHeaderMenu"
                bottom
                :close-on-content-click="false"
                :offset-y="getMenuOffset()"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="primary" v-bind="attrs" v-on="on">
                    <v-icon dark left>mdi-view-column-outline</v-icon> Choose
                    Columns to Display
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item v-for="(h, i) in headers" :key="i">
                    <v-checkbox
                      v-model="selectedHeaders"
                      :label="h.text"
                      :value="h"
                      hide-details="auto"
                    ></v-checkbox>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
        </v-container>
        <v-data-table
          class="mt-4"
          dense
          :headers="showHeaders"
          :items="domainTable"
          :footer-props="{
            'items-per-page-options': [10, 25, 50]
          }"
          item-key="CONCEPT_ID"
          :items-per-page="10"
          :search="search"
          :sort-by="['PERCENT_PERSONS']"
          :sort-desc="[true, false]"
        >
          <template v-slot:item.CONCEPT_ID="{ item }">
            <v-layout flex-end
              ><router-link :to="getReportRoute(item)">{{
                item.CONCEPT_ID
              }}</router-link></v-layout
            >
          </template>
          <template v-slot:item.CONCEPT_NAME="{ item }">
            <v-row>
              <v-col cols="10">
                <router-link
                  :to="getReportRoute(item)"
                  :title="item.CONCEPT_NAME"
                  >{{ item.CONCEPT_NAME }}
                </router-link>
              </v-col>
              <!--
              <v-col cols="2">
                <v-sparkline
                  height="25"
                  type="trend"
                  line-width="4"
                  radius="10"
                  padding="2"
                  :value="[100, 20, 50, 0, 100, 5]"
                ></v-sparkline>
              </v-col>
                -->
            </v-row>
          </template>
          <template v-slot:item.NUM_PERSONS="{ item }">
            <v-layout
              justify-end
              :class="getWeight(item.PERCENT_PERSONS_NTILE)"
              >{{ item.NUM_PERSONS }}</v-layout
            >
          </template>
          <template v-slot:item.PERCENT_PERSONS="{ item }">
            <v-layout justify-end :class="getWeight(item.PERCENT_PERSONS_NTILE)"
              >{{ (item.PERCENT_PERSONS * 100).toFixed(2) }} %</v-layout
            >
          </template>
          <template v-slot:item.RECORDS_PER_PERSON="{ item }">
            <v-layout
              justify-end
              :class="getWeight(item.RECORDS_PER_PERSON_NTILE)"
              >{{ item.RECORDS_PER_PERSON }}</v-layout
            >
          </template>
          <template v-slot:item.PERCENT_MISSING_VALUES="{ item }">
            <v-layout justify-end
              >{{
                item.PERCENT_MISSING_VALUES
                  ? `${((1 - item.PERCENT_MISSING_VALUES) * 100).toFixed(2)}%`
                  : "No data"
              }}
            </v-layout>
          </template>
          <template v-slot:item.AVERAGE_DURATION="{ item }">
            <v-layout justify-end>{{ item.AVERAGE_DURATION }}</v-layout>
          </template>
          <template v-slot:item.MEDIAN_VALUE="{ item }">
            <v-layout justify-end>{{ item.MEDIAN_VALUE }}</v-layout>
          </template>
          <template v-slot:item.P25_VALUE="{ item }">
            <v-layout justify-end>{{ item.P25_VALUE }}</v-layout>
          </template>
          <template v-slot:item.P75_VALUE="{ item }">
            <v-layout justify-end>{{ item.P75_VALUE }}</v-layout>
          </template>
        </v-data-table>
        <info-panel
          details="A summary of concepts in the domain including the percentage of people with at least one occurrence of the concept, the total number of people with at least one occurrence of the concept, and the average records per person."
        >
        </info-panel>
        <info-panel
          :divider="false"
          details="This table uses a preattentive processing visualization technique to highlight values in the top deciles by displaying the values in descending levels of font weight.  Darker values occur in the top 3 deciles of all values appearing in the column."
          link="https://policyviz.com/2018/08/07/dataviz-cheatsheet/"
          icon="mdi-eye"
        ></info-panel>
      </v-card>
    </v-container>
    <v-card
      v-if="this.$route.params.domain.toUpperCase() == 'VISIT_OCCURRENCE'"
      :loading="!dataLoaded"
      elevation="10"
      class="ma-4 pa-2"
    >
      <VegaChart
        v-if="visitStratification && dataLoaded"
        id="viz-stratificationbyvisit"
        :config="specVisitStratification"
        :data="$store.getters.getData.domainVisitStratification"
        title="Domain Data Stratification by Visit"
      />
      <v-card-text>
        <v-icon color="info" small left>mdi-help-circle</v-icon>
        Any domain data categorized as a Visit of 'No matching concept' implies
        that this data had no associated Visit on the Domain record.
      </v-card-text>
    </v-card>
    <v-card
      v-if="isDrugExposure"
      :loading="!dataLoaded"
      elevation="10"
      class="ma-4 pa-2"
    >
      <VegaChart
        v-if="dataLoaded"
        id="viz-stratificationbydrugtype"
        :config="specDrugTypeStratification"
        :data="drugStratification"
        title="Drug Domain Stratification by Drug Type"
      />
    </v-card>
  </div>
</template>

<script>
import * as d3Import from "d3-dsv";
import * as d3Format from "d3-format";
import InfoPanel from "../../components/InfoPanel.vue";
import { debounce } from "lodash";
import { charts } from "@/configs";
import { FETCH_FILES } from "@/data/store/modules/view/actions.type";
import {
  DOMAIN_DRUG_STRATIFICATION,
  DOMAIN_ISSUES,
  DOMAIN_SUMMARY,
  DOMAIN_VISIT_STRATIFICATION
} from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
import VegaChart from "@/interface/components/VegaChart";
export default {
  data: function() {
    return {
      chooseHeaderMenu: false,
      dataLoaded: false,
      issueDataLoaded: false,
      issueCount: 0,
      isEra: false,
      isMeasurement: false,
      isVisit: false,
      isDrugExposure: false,
      visitStratification: false,
      drugStratification: [],
      domainTable: [],
      domainIssues: [],
      search: "",
      selectedHeaders: [],
      headers: [],
      headersMap: {
        CONCEPT_ID: {
          text: "Concept Id",
          sortable: true,
          value: "CONCEPT_ID",
          align: "start"
        },
        CONCEPT_NAME: {
          text: "Concept Name",
          sortable: true,
          value: "CONCEPT_NAME",
          align: "start"
        },
        NUM_PERSONS: {
          text: "# People",
          sortable: true,
          value: "NUM_PERSONS",
          align: "end"
        },
        PERCENT_PERSONS: {
          text: "% People",
          sortable: true,
          value: "PERCENT_PERSONS",
          align: "end"
        },
        RECORDS_PER_PERSON: {
          text: "Records per Person",
          sortable: true,
          value: "RECORDS_PER_PERSON",
          align: "end"
        },
        AVERAGE_DURATION: {
          text: "Avg Duration",
          sortable: true,
          value: "AVERAGE_DURATION",
          align: "end"
        },
        PERCENT_WITH_VALUE: {
          text: "% with Values",
          sortable: true,
          value: "PERCENT_MISSING_VALUES",
          align: "end"
        }
      },
      specVisitStratification: charts.specVisitStratification,
      specDrugTypeStratification: charts.specDrugTypeStratification
    };
  },
  watch: {
    $route() {
      this.load();
    }
  },
  methods: {
    delayedSearch: debounce(function(data) {
      this.search = data;
    }, 300),
    getWeight: function(decile) {
      if (decile == 1) {
        return "font-weight-black";
      } else if (decile == 2) {
        return "font-weight-bold";
      } else if (decile == 3) {
        return "font-weight-medium";
      } else if (decile == 9 || decile == 10) {
        return "font-weight-light";
      } else {
        return "font-weight-regular";
      }
    },
    formatThousands: function(value) {
      return d3Format.format(",")(value);
    },
    navigateToDataQuality: function() {
      const qualitypath =
        "/cdm/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/data_quality";

      this.$router.push({
        path: qualitypath,
        query: {
          tab: "results",
          domainFailFilter: this.$route.params.domain
        }
      });
    },
    getMenuOffset: function() {
      return true;
    },
    columnValueList(val) {
      return this.checkResults.map(d => d[val]);
    },
    getReportRoute(item) {
      return (
        "/cdm/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/" +
        this.$route.params.domain +
        "/" +
        item.CONCEPT_ID
      );
    },
    load() {
      this.dataLoaded = false;
      this.domainTable = [];
      this.domainIssues = [];
      this.issueCount = 0;
      this.issueDataLoaded = false;

      const domain = this.$route.params.domain.toUpperCase();

      if (domain == "VISIT_OCCURRENCE" || domain == "VISIT_DETAIL") {
        this.isVisit = true;
        this.headersMap.AVERAGE_DURATION = {
          text: "Avg Duration",
          sortable: true,
          value: "AVERAGE_DURATION",
          align: "end"
        };
      } else {
        this.isVisit = false;
        delete this.headersMap.AVERAGE_DURATION;
      }

      if (domain == "MEASUREMENT") {
        this.isMeasurement = true;
        this.headersMap.PERCENT_WITH_VALUE = {
          text: "% with Values",
          sortable: true,
          value: "PERCENT_MISSING_VALUES",
          align: "end"
        };
      } else {
        this.isMeasurement = false;
        delete this.headersMap.PERCENT_WITH_VALUE;
      }

      if (domain == "DRUG_ERA" || domain == "CONDITION_ERA") {
        this.isEra = true;
        this.headersMap.MEDIAN_VALUE = {
          text: "Median Era Length (Days)",
          sortable: true,
          value: "MEDIAN_VALUE",
          align: "end"
        };
        this.headersMap.P25_VALUE = {
          text: "25th % Era Length (Days)",
          sortable: true,
          value: "P25_VALUE"
        };
        this.headersMap.P75_VALUE = {
          text: "75th % Era Length (Days)",
          sortable: true,
          value: "P75_VALUE"
        };
      } else {
        this.isEra = false;
        delete this.headersMap.MEDIAN_VALUE;
        delete this.headersMap.P25_VALUE;
        delete this.headersMap.P75_VALUE;
      }

      const files = [
        { name: DOMAIN_SUMMARY, required: true },
        { name: DOMAIN_ISSUES, required: true }
      ];
      if (this.$route.params.domain.toUpperCase() === "DRUG_EXPOSURE") {
        files.push({ name: DOMAIN_DRUG_STRATIFICATION, required: false });
      }
      if (this.$route.params.domain.toUpperCase() === "VISIT_OCCURRENCE") {
        files.push({ name: DOMAIN_VISIT_STRATIFICATION, required: true });
      }

      this.$store
        .dispatch(FETCH_FILES, {
          files: files
        })
        .then(() => {
          if (!this.getErrors) {
            this.headers = Object.values(this.headersMap);
            if (this.isVisit) {
              this.selectedHeaders = this.headers.filter(h =>
                [
                  "CONCEPT_ID",
                  "CONCEPT_NAME",
                  "PERCENT_PERSONS",
                  "RECORDS_PER_PERSON",
                  "AVERAGE_DURATION"
                ].includes(h.value)
              );
            } else if (this.isEra) {
              this.selectedHeaders = this.headers.filter(h =>
                [
                  "CONCEPT_ID",
                  "CONCEPT_NAME",
                  "PERCENT_PERSONS",
                  "RECORDS_PER_PERSON",
                  "MEDIAN_VALUE"
                ].includes(h.value)
              );
            } else if (this.isMeasurement) {
              this.selectedHeaders = this.headers.filter(h =>
                [
                  "CONCEPT_ID",
                  "CONCEPT_NAME",
                  "PERCENT_PERSONS",
                  "RECORDS_PER_PERSON",
                  "PERCENT_MISSING_VALUES"
                ].includes(h.value)
              );
            } else {
              this.selectedHeaders = this.headers.filter(h =>
                [
                  "CONCEPT_ID",
                  "CONCEPT_NAME",
                  "PERCENT_PERSONS",
                  "RECORDS_PER_PERSON"
                ].includes(h.value)
              );
            }
            this.domainTable = d3Import.csvParse(this.getData[DOMAIN_SUMMARY]);
            this.domainIssues = d3Import.csvParse(this.getData[DOMAIN_ISSUES]);
            const domainIssue = this.domainIssues.find(
              di => di.cdm_table_name === this.$route.params.domain
            );
            this.issueCount = domainIssue?.count_failed || 0;

            if (this.getData[DOMAIN_DRUG_STRATIFICATION]) {
              this.isDrugExposure = true;
              this.drugStratification = d3Import.csvParse(
                this.getData[DOMAIN_DRUG_STRATIFICATION]
              );
            }
            if (this.$route.params.domain.toUpperCase() == "VISIT_OCCURRENCE") {
              this.getData[DOMAIN_VISIT_STRATIFICATION] = d3Import.csvParse(
                this.getData[DOMAIN_VISIT_STRATIFICATION]
              );
              this.visitStratification = true;
            }
            this.dataLoaded = true;
            this.issueDataLoaded = true;
          }
        });
    }
  },
  created() {
    this.load();
  },
  components: {
    VegaChart,
    InfoPanel
  },
  computed: {
    showHeaders() {
      return this.headers.filter(s => this.selectedHeaders.includes(s));
    },
    ...mapGetters(["getData", "getErrors"])
  },
  props: {
    resultFile: String
  }
};
</script>

<style scoped>
td {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.viz-container {
  width: 90%;
}
</style>
