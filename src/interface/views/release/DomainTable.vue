<template>
  <div v-if="!getErrors">
    <v-container fluid class="pa-1">
      <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
        <div v-if="dataInStore">
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
                <v-tooltip v-if="issueCount > 0" left nudge-left="15">
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
                  :value="$route.query.search"
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
            v-if="getData"
            class="mt-4"
            dense
            :headers="showHeaders"
            :items="getData.domainTable"
            :footer-props="{
              'items-per-page-options': [10, 25, 50],
            }"
            item-key="CONCEPT_ID"
            :items-per-page="10"
            :search="$route.query.search"
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
              </v-row>
            </template>
            <template v-slot:item.NUM_PERSONS="{ item }">
              <v-layout
                justify-end
                :class="getWeight(item.PERCENT_PERSONS_NTILE)"
                >{{ formatComma(item.NUM_PERSONS) }}</v-layout
              >
            </template>
            <template v-slot:item.PERCENT_PERSONS="{ item }">
              <v-layout
                justify-end
                :class="getWeight(item.PERCENT_PERSONS_NTILE)"
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
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex.DOMAIN_SUMMARY[$route.params.domain.toUpperCase()]
              )
            "
            :divider="false"
          ></info-panel>
        </div>
      </v-card>
    </v-container>
    <v-card
      v-if="this.$route.params.domain.toUpperCase() == 'VISIT_OCCURRENCE'"
      :loading="!dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <VegaChart
        v-if="dataInStore && getData.domainStratification"
        id="viz-stratificationbyvisit"
        :config="specVisitStratification"
        :data="getData.domainStratification"
        title="Domain Data Stratification by Visit"
      />
      <info-panel
        details="Any domain data categorized as a Visit of 'No matching concept' implies
        that this data had no associated Visit on the Domain record."
        :divider="true"
      ></info-panel>
      <info-panel
        v-if="getQueryIndex"
        icon="mdi-code-braces"
        details="View export query."
        :link-details="true"
        :link="
          getQueryLink(getQueryIndex.DOMAIN_SUMMARY.DOMAIN_VISIT_STRATIFICATION)
        "
        :divider="false"
      ></info-panel>
    </v-card>
    <v-card
      v-if="this.$route.params.domain.toUpperCase() == 'DRUG_EXPOSURE'"
      :loading="!dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <VegaChart
        v-if="dataInStore && getData.drugStratification"
        id="viz-stratificationbydrugtype"
        :config="specDrugTypeStratification"
        :data="getData.drugStratification"
        title="Drug Domain Stratification by Drug Type"
      />
      <info-panel
        v-if="getQueryIndex"
        icon="mdi-code-braces"
        details="View export query."
        :link-details="true"
        :link="
          getQueryLink(getQueryIndex.DOMAIN_SUMMARY.DOMAIN_DRUG_STRATIFICATION)
        "
        :divider="false"
      ></info-panel>
    </v-card>
  </div>
</template>

<script>
import InfoPanel from "../../components/InfoPanel.vue";
import { debounce } from "lodash";
import { charts } from "@/configs";
import { mapGetters } from "vuex";
import VegaChart from "@/interface/components/VegaChart";
import * as d3Format from "d3-format";
export default {
  data: function () {
    return {
      chooseHeaderMenu: false,
      isEra: false,
      isMeasurement: false,
      isVisit: false,
      selectedHeaders: [],
      headers: [],
      headersMap: {
        CONCEPT_ID: {
          text: "Concept Id",
          sortable: true,
          value: "CONCEPT_ID",
          align: "start",
        },
        CONCEPT_NAME: {
          text: "Concept Name",
          sortable: true,
          value: "CONCEPT_NAME",
          align: "start",
        },
        NUM_PERSONS: {
          text: "# People",
          sortable: true,
          value: "NUM_PERSONS",
          align: "end",
        },
        PERCENT_PERSONS: {
          text: "% People",
          sortable: true,
          value: "PERCENT_PERSONS",
          align: "end",
        },
        RECORDS_PER_PERSON: {
          text: "Records per Person",
          sortable: true,
          value: "RECORDS_PER_PERSON",
          align: "end",
        },
        AVERAGE_DURATION: {
          text: "Avg Duration",
          sortable: true,
          value: "AVERAGE_DURATION",
          align: "end",
        },
        PERCENT_WITH_VALUE: {
          text: "% with Values",
          sortable: true,
          value: "PERCENT_MISSING_VALUES",
          align: "end",
        },
      },
      specVisitStratification: charts.specVisitStratification,
      specDrugTypeStratification: charts.specDrugTypeStratification,
    };
  },
  methods: {
    formatComma: function (value) {
      return d3Format.format(",")(value);
    },
    getQueryLink(queryPath) {
      return `https://github.com/OHDSI/Achilles/tree/main/inst/sql/sql_server/${queryPath}`;
    },
    delayedSearch: debounce(function (data) {
      this.$router.push({
        query: {
          search: data,
        },
      });
    }, 300),
    getWeight: function (decile) {
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
    navigateToDataQuality: function () {
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
          CDM_TABLE_NAME: this.$route.params.domain.toUpperCase(),
          FAILED: "FAIL",
        },
      });
    },
    getMenuOffset: function () {
      return true;
    },
    columnValueList(val) {
      return this.checkResults.map((d) => d[val]);
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
      const domain = this.$route.params.domain.toUpperCase();

      if (domain == "VISIT_OCCURRENCE" || domain == "VISIT_DETAIL") {
        this.isVisit = true;
        this.headersMap.AVERAGE_DURATION = {
          text: "Avg Duration",
          sortable: true,
          value: "AVERAGE_DURATION",
          align: "end",
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
          align: "end",
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
          align: "end",
        };
        this.headersMap.P25_VALUE = {
          text: "25th % Era Length (Days)",
          sortable: true,
          value: "P25_VALUE",
        };
        this.headersMap.P75_VALUE = {
          text: "75th % Era Length (Days)",
          sortable: true,
          value: "P75_VALUE",
        };
      } else {
        this.isEra = false;
        delete this.headersMap.MEDIAN_VALUE;
        delete this.headersMap.P25_VALUE;
        delete this.headersMap.P75_VALUE;
      }

      this.headers = Object.values(this.headersMap);
      if (this.isVisit) {
        this.selectedHeaders = this.headers.filter((h) =>
          [
            "CONCEPT_ID",
            "CONCEPT_NAME",
            "PERCENT_PERSONS",
            "RECORDS_PER_PERSON",
            "AVERAGE_DURATION",
          ].includes(h.value)
        );
      } else if (this.isEra) {
        this.selectedHeaders = this.headers.filter((h) =>
          [
            "CONCEPT_ID",
            "CONCEPT_NAME",
            "PERCENT_PERSONS",
            "RECORDS_PER_PERSON",
            "MEDIAN_VALUE",
          ].includes(h.value)
        );
      } else if (this.isMeasurement) {
        this.selectedHeaders = this.headers.filter((h) =>
          [
            "CONCEPT_ID",
            "CONCEPT_NAME",
            "PERCENT_PERSONS",
            "RECORDS_PER_PERSON",
            "PERCENT_MISSING_VALUES",
          ].includes(h.value)
        );
      } else {
        this.selectedHeaders = this.headers.filter((h) =>
          [
            "CONCEPT_ID",
            "CONCEPT_NAME",
            "PERCENT_PERSONS",
            "RECORDS_PER_PERSON",
          ].includes(h.value)
        );
      }
    },
  },
  created() {
    this.load();
  },
  components: {
    VegaChart,
    InfoPanel,
  },
  computed: {
    showHeaders() {
      return this.headers.filter((s) => this.selectedHeaders.includes(s));
    },
    domainIssue: function () {
      if (this.getData) {
        return this.getData.domainIssues.find(
          (di) => di.cdm_table_name === this.$route.params.domain
        );
      } else {
        return [];
      }
    },

    issueCount: function () {
      return this.domainIssue?.count_failed || 0;
    },
    ...mapGetters(["getData", "getErrors", "dataInStore", "getQueryIndex"]),
  },
  props: {
    resultFile: String,
  },
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
