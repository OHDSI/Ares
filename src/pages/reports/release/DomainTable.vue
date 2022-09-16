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
                    <v-btn
                      icon
                      tile
                      @click="
                        navigateTo(
                          'dataQuality',
                          {
                            cdm: $route.params.cdm,
                            release: $route.params.release,
                          },
                          {
                            tab: 'results',
                            CDM_TABLE_NAME: $route.params.domain.toUpperCase(),
                            FAILED: 'FAIL',
                          }
                        )
                      "
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
                  @input="debouncedSearch"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-menu
                  v-model="chooseHeaderMenu"
                  bottom
                  :close-on-content-click="false"
                  :offset-y="true"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn color="primary" v-bind="attrs" v-on="on">
                      <v-icon dark left>mdi-view-column-outline</v-icon> Choose
                      Columns to Display
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item v-for="(h, i) in getHeadersByDomain" :key="i">
                      <v-checkbox
                        v-model="h.show"
                        :label="h.text"
                        :value="h.show"
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
                :class="getFontWeight(item.PERCENT_PERSONS_NTILE)"
                >{{ formatComma(item.NUM_PERSONS) }}</v-layout
              >
            </template>
            <template v-slot:item.PERCENT_PERSONS="{ item }">
              <v-layout
                justify-end
                :class="getFontWeight(item.PERCENT_PERSONS_NTILE)"
                >{{ (item.PERCENT_PERSONS * 100).toFixed(2) }} %</v-layout
              >
            </template>
            <template v-slot:item.RECORDS_PER_PERSON="{ item }">
              <v-layout
                justify-end
                :class="getFontWeight(item.RECORDS_PER_PERSON_NTILE)"
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
          </v-data-table>
          <info-panel
            details="A summary of concepts in the domain including the percentage of people with at least one occurrence of the concept, the total number of people with at least one occurrence of the concept, and the average records per person."
          >
          </info-panel>
          <info-panel
            :divider="false"
            details="This table uses a preattentive processing visualization technique to highlight values in the top deciles by displaying the values in descending levels of font weight.  Darker values occur in the top 3 deciles of all values appearing in the column."
            :link="getDatavizDatasheetLink"
            icon="mdi-eye"
          ></info-panel>
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getSqlQueryLink(
                getQueryIndex.DOMAIN_SUMMARY[$route.params.domain.toUpperCase()]
              )
            "
            :divider="false"
          ></info-panel>
        </div>
      </v-card>
    </v-container>
    <v-card
      v-if="$route.params.domain.toUpperCase() === 'VISIT_OCCURRENCE'"
      :loading="!dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <Chart
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
          getSqlQueryLink(
            getQueryIndex.DOMAIN_SUMMARY.DOMAIN_VISIT_STRATIFICATION
          )
        "
        :divider="false"
      ></info-panel>
    </v-card>
    <v-card
      v-if="$route.params.domain.toUpperCase() === 'DRUG_EXPOSURE'"
      :loading="!dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <Chart
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
          getSqlQueryLink(
            getQueryIndex.DOMAIN_SUMMARY.DOMAIN_DRUG_STRATIFICATION
          )
        "
        :divider="false"
      ></info-panel>
    </v-card>
  </div>
</template>

<script>
import InfoPanel from "../../../widgets/infoPanel";
import { chartConfigs, Chart } from "@/widgets/chart";
import { mapGetters } from "vuex";
import { mixins } from "@/shared/lib/mixins";
import { getLinks } from "@/shared/config/links";

export default {
  components: {
    Chart,
    InfoPanel,
  },
  mixins: [mixins, getLinks],
  data: function () {
    return {
      chooseHeaderMenu: false,
      headers: [
        {
          text: "Concept Id",
          sortable: true,
          value: "CONCEPT_ID",
          align: "start",
          show: true,
          domain: ["ALL"],
        },
        {
          text: "Concept Name",
          sortable: true,
          value: "CONCEPT_NAME",
          align: "start",
          show: true,
          domain: ["ALL"],
        },
        {
          text: "# People",
          sortable: true,
          value: "NUM_PERSONS",
          align: "end",
          show: false,
          domain: ["ALL"],
        },
        {
          text: "% People",
          sortable: true,
          value: "PERCENT_PERSONS",
          align: "end",
          show: true,
          domain: ["ALL"],
        },
        {
          text: "Records per Person",
          sortable: true,
          value: "RECORDS_PER_PERSON",
          align: "end",
          show: true,
          domain: ["ALL"],
        },
        {
          text: "Avg Duration",
          sortable: true,
          value: "AVERAGE_DURATION",
          align: "end",
          domain: ["VISIT_OCCURRENCE", "VISIT_DETAIL"],
          show: true,
        },
        {
          text: "% with Values",
          sortable: true,
          value: "PERCENT_MISSING_VALUES",
          align: "end",
          domain: ["MEASUREMENT"],
          show: true,
        },
        {
          text: "Median Era Length (Days)",
          sortable: true,
          value: "MEDIAN_VALUE",
          align: "end",
          domain: ["DRUG_ERA", "CONDITION_ERA"],
          show: true,
        },
        {
          text: "25th % Era Length (Days)",
          sortable: true,
          align: "end",
          value: "P25_VALUE",
          domain: ["DRUG_ERA", "CONDITION_ERA"],
          show: false,
        },
        {
          text: "75th % Era Length (Days)",
          sortable: true,
          align: "end",
          value: "P75_VALUE",
          domain: ["DRUG_ERA", "CONDITION_ERA"],
          show: false,
        },
      ],
      specVisitStratification: chartConfigs.specVisitStratification,
      specDrugTypeStratification: chartConfigs.specDrugTypeStratification,
    };
  },
  computed: {
    getHeadersByDomain() {
      const openedDomain = this.$route.params.domain.toUpperCase();
      return this.headers.filter(
        (value) =>
          value.domain.includes("ALL") || value.domain.includes(openedDomain)
      );
    },
    showHeaders() {
      return this.getHeadersByDomain.filter((header) => header.show);
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
  methods: {
    getReportRoute(item) {
      return {
        name: "concept",
        params: { concept: item.CONCEPT_ID },
      };
    },
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
