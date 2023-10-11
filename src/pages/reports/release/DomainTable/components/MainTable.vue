<template>
  <v-card :loading="!store.getters.dataInStore" elevation="2" class="ma-4">
    <div v-if="store.getters.dataInStore">
      <ChartHeader :title="route.params.domain.toUpperCase().replace('_', ' ')">
        <ChartActionIcon
          icon="mdi-database"
          :tooltip="
            issueCount > 0
              ? 'Data quality issues were identified for this domain'
              : ''
          "
          :count="issueCount"
          @iconClicked="navigateToDataQuality"
        />
      </ChartHeader>
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
        <template v-slot:item.DIFF_NUM_PERSONS="{ item }">
          <v-layout class="justify-end">
            {{
              item.raw.DIFF_NUM_PERSONS
                ? helpers.formatComma(item.raw.DIFF_NUM_PERSONS)
                : "No data"
            }}
          </v-layout>
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
        <template v-slot:item.DIFF_PERCENT_PERSONS="{ item }">
          <v-layout class="justify-end"
            ><div
              :class="
                helpers.getFontWeight(item.raw.DIFF_PERCENT_PERSONS_NTILE)
              "
            >
              {{
                item.raw.DIFF_PERCENT_PERSONS
                  ? (item.raw.DIFF_PERCENT_PERSONS * 100).toFixed(2) + " %"
                  : "No data"
              }}
            </div></v-layout
          >
        </template>
        <template v-slot:item.RECORDS_PER_PERSON="{ item }">
          <v-layout class="justify-end"
            ><div
              :class="helpers.getFontWeight(item.raw.RECORDS_PER_PERSON_NTILE)"
            >
              {{ item.raw.RECORDS_PER_PERSON }}
            </div></v-layout
          >
        </template>
        <template v-slot:item.DIFF_RECORDS_PER_PERSON="{ item }">
          {{
            item.raw.DIFF_RECORDS_PER_PERSON
              ? item.raw.DIFF_RECORDS_PER_PERSON
              : "No data"
          }}
        </template>
        <template v-slot:item.PERCENT_MISSING_VALUES="{ item }">
          <v-layout class="justify-end"
            >{{
              item.raw.PERCENT_MISSING_VALUES
                ? `${((1 - item.raw.PERCENT_MISSING_VALUES) * 100).toFixed(
                    2
                  )} %`
                : "No data"
            }}
          </v-layout>
        </template>
      </v-data-table>
      <v-toolbar density="compact" class="mt-6">
        <ChartActionIcon
          icon="mdi-help-circle"
          tooltip="A summary of concepts in the domain including the percentage of people with at least one occurrence of the concept, the total number of people with at least one occurrence of the concept, and the average records per person."
        />
        <ChartActionIcon
          icon="mdi-eye"
          tooltip="This table uses a preattentive processing visualization technique to highlight values in the top deciles by displaying the values in descending levels of font weight.  Darker values occur in the top 3 deciles of all values appearing in the column."
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          icon="mdi-code-braces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.DOMAIN_SUMMARY[
                  route.params.domain.toUpperCase()
                ]
              )
            )
          "
        />
      </v-toolbar>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { VDataTable } from "vuetify/labs/VDataTable";
import SelectColumns from "@/features/selectColumns";

import { helpers } from "@/shared/lib/mixins";
import { links } from "@/shared/config/links";
import { computed, ref } from "vue";
import { debounce } from "lodash";
import { DomainIssues } from "@/processes/exploreReports/model/interfaces/files/DomainIssues";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

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
    title: "Delta # Person",
    sortable: true,
    key: "DIFF_NUM_PERSONS",
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
    title: "Delta % People",
    sortable: true,
    key: "DIFF_PERCENT_PERSONS",
    align: "end",
    show: false,
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
    title: "Delta Records per Person",
    sortable: true,
    key: "DIFF_RECORDS_PER_PERSON",
    align: "end",
    show: false,
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
      cdmTableName: route.params.domain.toUpperCase(),
      failed: "FAIL",
    },
  });
};
</script>

<style scoped></style>
