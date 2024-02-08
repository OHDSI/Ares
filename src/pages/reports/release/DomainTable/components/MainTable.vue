<template>
  <Panel
    v-if="store.getters.dataInStore"
    :header="openedDomain.split('_').join(' ')"
  >
    <template #icons>
      <ChartActionIcon
        :icon="mdiDatabase"
        :tooltip="
          issueCount > 0
            ? 'Data quality issues were identified for this domain'
            : ''
        "
        :count="issueCount"
        @iconClicked="navigateToDataQuality"
      />
    </template>
    <div class="p-5">
      <DataTable
        size="small"
        :value="store.getters.getData.domainTable"
        paginator
        v-model:filters="newFilters"
        :globalFilterFields="['CONCEPT_ID', 'CONCEPT_NAME', '']"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <template #header>
          <div class="flex flex-row gap-10">
            <InputGroup unstyled>
              <InputGroupAddon>
                <i class="pi pi-search"></i>
              </InputGroupAddon>
              <InputText
                class="rounded-r-lg"
                style="width: 45rem"
                unstyled
                :value="route.query.search"
                @update:modelValue="debouncedSearch"
                placeholder="Search in Table"
              />
            </InputGroup>
            <MultiSelect
              :pt="{
                root: 'dark:bg-primary-400 bg-primary-500 text-white rounded',
                labelContainer:
                  'dark:bg-primary-400 bg-primary-500 text-white rounded',
                trigger: [
                  'flex items-center justify-center shrink-0 rounded-tr-md rounded-br-md dark:bg-primary-400 w-12',
                ],
              }"
              v-model="selectedHeaders"
              data-key="title"
              option-label="title"
              option-value="key"
              :options="getHeaders"
              placeholder="Select Columns"
            >
              <template #value>
                <span class="flex flex-row w-full items-center">
                  <svg-icon type="mdi" :path="mdiTable"></svg-icon>
                  <span class="uppercase text-base">Columns to display</span>
                </span>
              </template>
            </MultiSelect>
          </div>
        </template>
        <Column
          :hidden="!selectedHeaders.includes('CONCEPT_ID')"
          field="CONCEPT_ID"
          header="Concept Id"
        >
          <template #body="slotProps">
            <router-link
              class="text-blue-400 hover:underline"
              :to="getReportRoute(slotProps.data)"
              :title="slotProps.data.CONCEPT_ID"
              >{{ slotProps.data.CONCEPT_ID }}
            </router-link>
          </template>
        </Column>
        <Column
          :hidden="!selectedHeaders.includes('CONCEPT_NAME')"
          field="CONCEPT_NAME"
          header="Concept Name"
        >
          <template #body="slotProps">
            <router-link
              class="text-blue-400 hover:underline"
              :to="getReportRoute(slotProps.data)"
              :title="slotProps.data.CONCEPT_NAME"
              >{{ slotProps.data.CONCEPT_NAME }}
            </router-link>
          </template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          :hidden="!selectedHeaders.includes('NUM_PERSONS')"
          field="NUM_PERSONS"
          header="# People"
        >
          <template #body="slotProps">
            <div
              :class="
                helpers.getFontWeight(slotProps.data.PERCENT_PERSONS_NTILE)
              "
            >
              {{ helpers.formatComma(slotProps.data.NUM_PERSONS) }}
            </div>
          </template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          :hidden="!selectedHeaders.includes('DIFF_NUM_PERSONS')"
          field="DIFF_NUM_PERSONS"
          header="Delta # Person"
        >
          <template #body="slotProps">
            <div>
              {{
                slotProps.data.DIFF_NUM_PERSONS
                  ? helpers.formatComma(slotProps.data.DIFF_NUM_PERSONS)
                  : "No data"
              }}
            </div>
          </template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          :hidden="!selectedHeaders.includes('PERCENT_PERSONS')"
          field="PERCENT_PERSONS"
          header="% People"
        >
          <template #body="slotProps">
            <div
              :class="
                helpers.getFontWeight(slotProps.data.PERCENT_PERSONS_NTILE)
              "
            >
              {{ (slotProps.data.PERCENT_PERSONS * 100).toFixed(2) }} %
            </div>
          </template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          :hidden="!selectedHeaders.includes('DIFF_PERCENT_PERSONS')"
          field="DIFF_PERCENT_PERSONS"
          header="Delta % People"
        >
          <template #body="slotProps">
            <div
              :class="
                helpers.getFontWeight(slotProps.data.DIFF_PERCENT_PERSONS_NTILE)
              "
            >
              {{ helpers.formatComma(slotProps.data.DIFF_PERCENT_PERSONS) }}
            </div>
          </template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          :hidden="!selectedHeaders.includes('RECORDS_PER_PERSON')"
          field="RECORDS_PER_PERSON"
          header="Records per Person"
        >
          <template #body="slotProps">
            <div
              :class="
                helpers.getFontWeight(slotProps.data.RECORDS_PER_PERSON_NTILE)
              "
            >
              {{ slotProps.data.RECORDS_PER_PERSON }}
            </div>
          </template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          :hidden="!selectedHeaders.includes('DIFF_RECORDS_PER_PERSON')"
          field="DIFF_RECORDS_PER_PERSON"
          header="Delta Records per Person"
        >
          <template #body="slotProps">
            {{
              slotProps.data.DIFF_RECORDS_PER_PERSON
                ? slotProps.data.DIFF_RECORDS_PER_PERSON
                : "No data"
            }}
          </template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          :hidden="!selectedHeaders.includes('AVERAGE_DURATION')"
          field="AVERAGE_DURATION"
          header="Avg Duration"
        >
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          :hidden="!selectedHeaders.includes('PERCENT_MISSING_VALUES')"
          field="PERCENT_MISSING_VALUES"
          header="% with Values"
        >
          <template #body="slotProps">
            {{
              slotProps.data.PERCENT_MISSING_VALUES
                ? `${(
                    (1 - slotProps.data.PERCENT_MISSING_VALUES) *
                    100
                  ).toFixed(2)} %`
                : "No data"
            }}
          </template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          :hidden="!selectedHeaders.includes('MEDIAN_VALUE')"
          field="MEDIAN_VALUE"
          header="Median Era Length (Days)"
        >
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          :hidden="!selectedHeaders.includes('P25_VALUE')"
          field="P25_VALUE"
          header="25th % Era Length (Days)"
        >
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          :hidden="!selectedHeaders.includes('P75_VALUE')"
          field="P75_VALUE"
          header="75th % Era Length (Days)"
        >
        </Column>
      </DataTable>

      <!--      <v-data-table-->
      <!--        v-if="store.getters.getData"-->
      <!--        class="mt-4"-->
      <!--        density="compact"-->
      <!--        :headers="showHeaders"-->
      <!--        :items="store.getters.getData.domainTable"-->
      <!--        :footer-props="{-->
      <!--          'items-per-page-options': [10, 25, 50],-->
      <!--        }"-->
      <!--        item-key="CONCEPT_ID"-->
      <!--        :items-per-page="10"-->
      <!--        :search="route.query.search"-->
      <!--        :sort-by="['PERCENT_PERSONS']"-->
      <!--        :sort-desc="[true, false]"-->
      <!--      >-->
      <!--        <template v-slot:item.CONCEPT_ID="{ item }">-->
      <!--          <v-layout flex-end-->
      <!--            ><router-link :to="getReportRoute(item)">{{-->
      <!--              item.raw.CONCEPT_ID-->
      <!--            }}</router-link></v-layout-->
      <!--          >-->
      <!--        </template>-->
      <!--        <template v-slot:item.CONCEPT_NAME="{ item }">-->
      <!--                <v-row>-->
      <!--                  <v-col cols="10">-->
      <!--                    <router-link-->
      <!--                      :to="getReportRoute(item)"-->
      <!--                      :title="item.raw.CONCEPT_NAME"-->
      <!--                      >{{ item.raw.CONCEPT_NAME }}-->
      <!--                    </router-link>-->
      <!--                  </v-col>-->
      <!--                </v-row>-->
      <!--        </template>-->
      <!--        <template v-slot:item.NUM_PERSONS="{ item }">-->
      <!--          <v-layout class="justify-end"-->
      <!--            ><div-->
      <!--              :class="helpers.getFontWeight(item.raw.PERCENT_PERSONS_NTILE)"-->
      <!--            >-->
      <!--              {{ helpers.formatComma(item.raw.NUM_PERSONS) }}-->
      <!--            </div></v-layout-->
      <!--          >-->
      <!--        </template>-->
      <!--      <template v-slot:item.DIFF_NUM_PERSONS="{ item }">-->
      <!--        <v-layout class="justify-end">-->
      <!--          {{-->
      <!--            item.raw.DIFF_NUM_PERSONS-->
      <!--              ? helpers.formatComma(item.raw.DIFF_NUM_PERSONS)-->
      <!--              : "No data"-->
      <!--          }}-->
      <!--        </v-layout>-->
      <!--      </template>-->
      <!--        <template v-slot:item.PERCENT_PERSONS="{ item }">-->
      <!--          <v-layout class="justify-end"-->
      <!--            ><div-->
      <!--              :class="helpers.getFontWeight(item.raw.PERCENT_PERSONS_NTILE)"-->
      <!--            >-->
      <!--              {{ (item.raw.PERCENT_PERSONS * 100).toFixed(2) }} %-->
      <!--            </div></v-layout-->
      <!--          >-->
      <!--        </template>-->
      <!--      <template v-slot:item.DIFF_PERCENT_PERSONS="{ item }">-->
      <!--        <v-layout class="justify-end"-->
      <!--          ><div-->
      <!--            :class="helpers.getFontWeight(item.raw.DIFF_PERCENT_PERSONS_NTILE)"-->
      <!--          >-->
      <!--            {{-->
      <!--              item.raw.DIFF_PERCENT_PERSONS-->
      <!--                ? (item.raw.DIFF_PERCENT_PERSONS * 100).toFixed(2) + " %"-->
      <!--                : "No data"-->
      <!--            }}-->
      <!--          </div></v-layout-->
      <!--        >-->
      <!--      </template>-->
      <!--      <template v-slot:item.RECORDS_PER_PERSON="{ item }">-->
      <!--        <v-layout class="justify-end"-->
      <!--          ><div-->
      <!--            :class="helpers.getFontWeight(item.raw.RECORDS_PER_PERSON_NTILE)"-->
      <!--          >-->
      <!--            {{ item.raw.RECORDS_PER_PERSON }}-->
      <!--          </div></v-layout-->
      <!--        >-->
      <!--      </template>-->
      <!--      <template v-slot:item.DIFF_RECORDS_PER_PERSON="{ item }">-->
      <!--        {{-->
      <!--          item.raw.DIFF_RECORDS_PER_PERSON-->
      <!--            ? item.raw.DIFF_RECORDS_PER_PERSON-->
      <!--            : "No data"-->
      <!--        }}-->
      <!--      </template>-->
      <!--        <template v-slot:item.PERCENT_MISSING_VALUES="{ item }">-->
      <!--          <v-layout class="justify-end"-->
      <!--            >{{-->
      <!--              item.raw.PERCENT_MISSING_VALUES-->
      <!--                ? `${((1 - item.raw.PERCENT_MISSING_VALUES) * 100).toFixed(-->
      <!--                    2-->
      <!--                  )} %`-->
      <!--                : "No data"-->
      <!--            }}-->
      <!--          </v-layout>-->
      <!--        </template>-->
      <!--      </v-data-table>-->
    </div>
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="A summary of concepts in the domain including the percentage of people with at least one occurrence of the concept, the total number of people with at least one occurrence of the concept, and the average records per person."
        />
        <ChartActionIcon
          :icon="mdiEye"
          tooltip="This table uses a preattentive processing visualization technique to highlight values in the top deciles by displaying the values in descending levels of font weight.  Darker values occur in the top 3 deciles of all values appearing in the column."
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
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
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { helpers } from "@/shared/lib/mixins";
import { computed, onMounted, ref, watch } from "vue";
import { debounce } from "lodash";
import { DomainIssues } from "@/processes/exploreReports/model/interfaces/files/DomainIssues";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import { FilterMatchMode } from "primevue/api";
import {
  mdiCodeBraces,
  mdiDatabase,
  mdiEye,
  mdiHelpCircle,
  mdiTable,
} from "@mdi/js";
import SvgIcon from "@jamescoyle/vue-icon";
import { links } from "@/shared/config/links";

const store = useStore();
const route = useRoute();
const router = useRouter();

const openedDomain = computed(() => route.params.domain?.toUpperCase());

const newFilters = computed(() => ({
  global: { value: route.query.search, matchMode: FilterMatchMode.CONTAINS },
}));

const headers = ref({
  CONCEPT_ID: {
    title: "Concept Id",
    sortable: true,
    key: "CONCEPT_ID",
    align: "start",
    show: true,
    domain: ["ALL"],
  },
  CONCEPT_NAME: {
    title: "Concept Name",
    sortable: true,
    key: "CONCEPT_NAME",
    align: "start",
    show: true,
    domain: ["ALL"],
  },
  NUM_PERSONS: {
    title: "# People",
    sortable: true,
    key: "NUM_PERSONS",
    align: "end",
    show: false,
    domain: ["ALL"],
  },
  DIFF_NUM_PERSONS: {
    title: "Delta # Person",
    sortable: true,
    key: "DIFF_NUM_PERSONS",
    align: "end",
    show: false,
    domain: ["ALL"],
  },
  PERCENT_PERSONS: {
    title: "% People",
    sortable: true,
    key: "PERCENT_PERSONS",
    align: "end",
    show: true,
    domain: ["ALL"],
  },
  DIFF_PERCENT_PERSONS: {
    title: "Delta % People",
    sortable: true,
    key: "DIFF_PERCENT_PERSONS",
    align: "end",
    show: false,
    domain: ["ALL"],
  },
  RECORDS_PER_PERSON: {
    title: "Records per Person",
    sortable: true,
    key: "RECORDS_PER_PERSON",
    align: "end",
    show: true,
    domain: ["ALL"],
  },
  DIFF_RECORDS_PER_PERSON: {
    title: "Delta Records per Person",
    sortable: true,
    key: "DIFF_RECORDS_PER_PERSON",
    align: "end",
    show: false,
    domain: ["ALL"],
  },
  AVERAGE_DURATION: {
    title: "Avg Duration",
    sortable: true,
    key: "AVERAGE_DURATION",
    align: "end",
    domain: ["VISIT_OCCURRENCE", "VISIT_DETAIL"],
    show: true,
  },
  PERCENT_MISSING_VALUES: {
    title: "% with Values",
    sortable: true,
    key: "PERCENT_MISSING_VALUES",
    align: "end",
    domain: ["MEASUREMENT"],
    show: true,
  },
  MEDIAN_VALUE: {
    title: "Median Era Length (Days)",
    sortable: true,
    key: "MEDIAN_VALUE",
    align: "end",
    domain: ["DRUG_ERA", "CONDITION_ERA"],
    show: true,
  },
  P25_VALUE: {
    title: "25th % Era Length (Days)",
    sortable: true,
    align: "end",
    key: "P25_VALUE",
    domain: ["DRUG_ERA", "CONDITION_ERA"],
    show: false,
  },
  P75_VALUE: {
    title: "75th % Era Length (Days)",
    sortable: true,
    align: "end",
    key: "P75_VALUE",
    domain: ["DRUG_ERA", "CONDITION_ERA"],
    show: false,
  },
});

const selectedHeaders = ref([]);

const getHeaders = computed(() => {
  return Object.values(headers.value).filter(
    (value) =>
      value.domain.includes("ALL") || value.domain.includes(openedDomain.value)
  );
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
    params: { concept: item.CONCEPT_ID },
  };
};

const setDefaultSelectedHeaders = function () {
  selectedHeaders.value = Object.values(headers.value)
    .filter(
      (value) =>
        (value.domain.includes("ALL") ||
          value.domain.includes(openedDomain.value)) &&
        value.show
    )
    .reduce((acc, val) => [...acc, val.key], []);
};

onMounted(() => {
  setDefaultSelectedHeaders();
});
watch(route, () => {
  setDefaultSelectedHeaders();
});

const navigateToDataQuality = function () {
  router.push({
    name: "dataQuality",
    params: {
      cdm: route.params.cdm,
      release: route.params.release,
    },
    query: {
      tab: 2,
      cdmTableName: openedDomain.value,
      failed: "FAIL",
    },
  });
};
</script>

<style scoped>
.p-inputtext {
  width: 200%;
}
</style>
