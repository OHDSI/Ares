<template>
  <Panel header="Domain Continuity">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Echarts
      id="viz-continuity"
      :data="data"
      :chart-spec="getEChartsOverview"
      :height="totalHeight"
    />
    <CollapseTransition>
      <div v-if="showTable" class="p-4">
        <DataTable
          :striped-rows="store.getters.getSettings.strippedRows"
          size="small"
          :value="data"
          paginator
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20, 50]"
        >
          <Column field="release_date" header="Date"> </Column>
          <Column field="domain" header="Domain"> </Column>
          <Column
            :pt="{ headerContent: 'justify-end' }"
            sortable
            header="Records"
            field="count_records"
          >
            <template #body="slotProps">
              <div class="flex justify-end">
                {{
                  slotProps.data.count_records
                    ? formatComma(slotProps.data.count_records)
                    : "No data"
                }}
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </CollapseTransition>

    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Domain continuity shows the number of records in each domain table for multiple releases of data from a specific vendor or data source. This is NOT the number of records that occur at specific times within a CDM, but a count of the number of records in a release of a data source, graphed over time. This visualization allows one to see how the data is changing across updates for a single data source."
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.DOMAIN_SUMMARY.RECORDS_BY_DOMAIN[0],
              ),
            )
          "
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { RouteLocation, useRouter } from "vue-router";
import ChartActionIcon from "@/shared/ui/toggleIcon";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import ChartHeader from "@/widgets/echarts/chartHeader";
import { computed, ref } from "vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Echarts from "@/widgets/echarts/echarts";
import { getEChartsOverview } from "@/pages/reports/source/DomainContinuity/charts/domainRecords/domainContinuity";
import { formatComma, getPaddedDate } from "@/shared/lib/formatters";
import { getValuesArray, openNewTab } from "@/shared/lib/utils";

const store = useStore();
const router = useRouter();

//todo: listener

const navigate = function (route) {
  router.push(route);
  // hide tooltip otherwise it persists on navigation
  document.getElementById("vg-tooltip-element").style.display = "none";
};
const eventListener = function (result, route: RouteLocation) {
  return result.view.addEventListener("click", (event, item) => {
    const itemData = item.datum.datum;
    const releaseKey = getPaddedDate(new Date(itemData.release_date), "");
    const routeUrl = {
      name: "domainTable",
      params: {
        cdm: route.params.cdm,
        release: releaseKey,
        domain: itemData.domain.toLowerCase().split(" ").join("_"),
      },
    };
    navigate(routeUrl);
  });
};

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return store.getters.getData.domainRecords;
});

const domains = getValuesArray(data.value, "domain", true);

const facetCount = domains.length;
const perFacetHeight = 105;

const totalHeight = `${facetCount * perFacetHeight}px`;
</script>

<style scoped></style>
