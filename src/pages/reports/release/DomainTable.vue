<template>
  <div v-if="!store.getters.getErrors">
    <v-container fluid class="pa-1">
      <v-card
        :loading="!store.getters.dataInStore"
        elevation="10"
        class="ma-4 pa-2"
      >
        <div v-if="store.getters.dataInStore">
          <v-row
            ><v-col cols="8">
              <v-layout justify-start align-center class="ml-4 mr-4">
                <v-card-title>{{
                  route.params.domain.toUpperCase().replace("_", " ")
                }}</v-card-title>
              </v-layout>
            </v-col>
            <v-col cols="4">
              <v-layout class="ml-4 mr-4 justify-end align-center">
                <v-tooltip v-if="issueCount > 0" left nudge-left="15">
                  <template v-slot:activator="{ props }">
                    <v-btn variant="flat" icon @click="navigateToDataQuality">
                      <v-badge icon color="error" :content="issueCount">
                        <v-icon size="large" v-bind="props"
                          >mdi-database</v-icon
                        >
                      </v-badge>
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
                  density="compact"
                  variant="outlined"
                  hide-details
                  @update:modelValue="debouncedSearch"
                ></v-text-field>
              </v-col>
              <v-col>
                <SelectColumns :headers="getHeadersByDomain" />
              </v-col>
            </v-row>
          </v-container>
          <v-data-table
            v-if="store.getters.getData"
            class="mt-4"
            density="compact"
            :headers="showHeaders"
            :items="store.getters.getData.domainTable"
            :footer-props="{
              'items-per-page-options': [10, 25, 50],
            }"
            item-key="CONCEPT_ID"
            :items-per-page="10"
            :search="route.query.search"
            :sort-by="['PERCENT_PERSONS']"
            :sort-desc="[true, false]"
          >
            <template v-slot:item.CONCEPT_ID="{ item }">
              <v-layout flex-end
                ><router-link :to="getReportRoute(item)">{{
                  item.raw.CONCEPT_ID
                }}</router-link></v-layout
              >
            </template>
            <template v-slot:item.CONCEPT_NAME="{ item }">
              <v-row>
                <v-col cols="10">
                  <router-link
                    :to="getReportRoute(item)"
                    :title="item.raw.CONCEPT_NAME"
                    >{{ item.raw.CONCEPT_NAME }}
                  </router-link>
                </v-col>
              </v-row>
            </template>
            <template v-slot:item.NUM_PERSONS="{ item }">
              <v-layout class="justify-end"
                ><div
                  :class="helpers.getFontWeight(item.raw.PERCENT_PERSONS_NTILE)"
                >
                  {{ helpers.formatComma(item.raw.NUM_PERSONS) }}
                </div></v-layout
              >
            </template>
            <template v-slot:item.PERCENT_PERSONS="{ item }">
              <v-layout class="justify-end"
                ><div
                  :class="helpers.getFontWeight(item.raw.PERCENT_PERSONS_NTILE)"
                >
                  {{ (item.raw.PERCENT_PERSONS * 100).toFixed(2) }} %
                </div></v-layout
              >
            </template>
            <template v-slot:item.RECORDS_PER_PERSON="{ item }">
              <v-layout class="justify-end"
                ><div
                  :class="
                    helpers.getFontWeight(item.raw.RECORDS_PER_PERSON_NTILE)
                  "
                >
                  {{ item.raw.RECORDS_PER_PERSON }}
                </div></v-layout
              >
            </template>
            <template v-slot:item.PERCENT_MISSING_VALUES="{ item }">
              <v-layout class="justify-end"
                >{{
                  item.raw.PERCENT_MISSING_VALUES
                    ? `${((1 - item.raw.PERCENT_MISSING_VALUES) * 100).toFixed(
                        2
                      )}%`
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
            icon="mdi-eye"
          ></info-panel>
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :divider="false"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.DOMAIN_SUMMARY[
                  route.params.domain.toUpperCase()
                ]
              )
            "
          ></info-panel>
        </div>
      </v-card>
    </v-container>
    <v-card
      v-if="route.params.domain.toUpperCase() === 'VISIT_OCCURRENCE'"
      :loading="!store.getters.dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <Chart
        v-if="
          store.getters.dataInStore &&
          store.getters.getData.domainStratification
        "
        id="viz-stratificationbyvisit"
        :config="chartConfigs.specVisitStratification"
        :data="store.getters.getData.domainStratification"
        title="Domain Data Stratification by Visit"
      />
      <info-panel
        details="Any domain data categorized as a Visit of 'No matching concept' implies
        that this data had no associated Visit on the Domain record."
        :divider="true"
      ></info-panel>
      <info-panel
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        details="View export query."
        :divider="false"
      ></info-panel>
    </v-card>
    <v-card
      v-if="$route.params.domain.toUpperCase() === 'DRUG_EXPOSURE'"
      :loading="!store.getters.dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <Chart
        v-if="
          store.getters.dataInStore && store.getters.getData.drugStratification
        "
        id="viz-stratificationbydrugtype"
        :config="chartConfigs.specDrugTypeStratification"
        :data="store.getters.getData.drugStratification"
        title="Drug Domain Stratification by Drug Type"
      />
      <info-panel
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        details="View export query."
        :link-details="true"
        :divider="false"
        :link="
          links.getSqlQueryLink(
            store.getters.getQueryIndex.DOMAIN_SUMMARY
              .DOMAIN_DRUG_STRATIFICATION
          )
        "
      ></info-panel>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import InfoPanel from "../../../widgets/infoPanel";
import { chartConfigs, Chart } from "@/widgets/chart";
import { VDataTable } from "vuetify/labs/VDataTable";
import { helpers } from "@/shared/lib/mixins";
import { links } from "@/shared/config/links";
import SelectColumns from "@/features/selectColumns";

import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { debounce } from "lodash";
import { DomainIssues } from "@/processes/exploreReports/model/interfaces/files/DomainIssues";

const route = useRoute();
const router = useRouter();
const store = useStore();

const headers = ref([
  {
    title: "Concept Id",
    sortable: true,
    key: "CONCEPT_ID",
    align: "start",
    show: true,
    domain: ["ALL"],
  },
  {
    title: "Concept Name",
    sortable: true,
    key: "CONCEPT_NAME",
    align: "start",
    show: true,
    domain: ["ALL"],
  },
  {
    title: "# People",
    sortable: true,
    key: "NUM_PERSONS",
    align: "end",
    show: false,
    domain: ["ALL"],
  },
  {
    title: "% People",
    sortable: true,
    key: "PERCENT_PERSONS",
    align: "end",
    show: true,
    domain: ["ALL"],
  },
  {
    title: "Records per Person",
    sortable: true,
    key: "RECORDS_PER_PERSON",
    align: "end",
    show: true,
    domain: ["ALL"],
  },
  {
    title: "Avg Duration",
    sortable: true,
    key: "AVERAGE_DURATION",
    align: "end",
    domain: ["VISIT_OCCURRENCE", "VISIT_DETAIL"],
    show: true,
  },
  {
    title: "% with Values",
    sortable: true,
    key: "PERCENT_MISSING_VALUES",
    align: "end",
    domain: ["MEASUREMENT"],
    show: true,
  },
  {
    title: "Median Era Length (Days)",
    sortable: true,
    key: "MEDIAN_VALUE",
    align: "end",
    domain: ["DRUG_ERA", "CONDITION_ERA"],
    show: true,
  },
  {
    title: "25th % Era Length (Days)",
    sortable: true,
    align: "end",
    key: "P25_VALUE",
    domain: ["DRUG_ERA", "CONDITION_ERA"],
    show: false,
  },
  {
    title: "75th % Era Length (Days)",
    sortable: true,
    align: "end",
    key: "P75_VALUE",
    domain: ["DRUG_ERA", "CONDITION_ERA"],
    show: false,
  },
]);

const getHeadersByDomain = computed(function () {
  //add param type check
  const openedDomain = route.params.domain.toUpperCase();
  return headers.value.filter(
    (value) =>
      value.domain.includes("ALL") || value.domain.includes(openedDomain)
  );
});

const showHeaders = computed(() => {
  return getHeadersByDomain.value.filter((header) => header.show);
});

const debouncedSearch = debounce(function (data: string): void {
  router.push({
    query: {
      search: data,
    },
  });
}, 300);

const domainIssue = computed(function (): DomainIssues | [] {
  if (store.getters.getData) {
    return store.getters.getData.domainIssues.find(
      (di) => di.cdm_table_name === route.params.domain
    );
  } else {
    return [];
  }
});

const issueCount = computed(function (): number {
  return domainIssue.value?.count_failed || 0;
});

const getReportRoute = function (item) {
  return {
    name: "concept",
    params: { concept: item.raw.CONCEPT_ID },
  };
};

const navigateToDataQuality = function () {
  router.push({
    name: "dataQuality",
    params: {
      cdm: route.params.cdm,
      release: route.params.release,
    },
    query: {
      tab: "results",
      CDM_TABLE_NAME: route.params.domain.toUpperCase(),
      FAILED: "FAIL",
    },
  });
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
