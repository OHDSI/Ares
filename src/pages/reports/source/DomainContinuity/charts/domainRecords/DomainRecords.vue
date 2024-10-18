<template>
  <Panel header="Domain Continuity">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Chart
      id="viz-continuity"
      :chartSpec="specOverview"
      :data="data"
      :listener="eventListener"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
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
                  ? helpers.formatComma(slotProps.data.count_records)
                  : "No data"
              }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

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
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.DOMAIN_SUMMARY.RECORDS_BY_DOMAIN[0]
              )
            )
          "
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specOverview } from "./specOverview";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { RouteLocation, useRouter } from "vue-router";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { computed, ref } from "vue";
import { QUALITY_INDEX } from "@/shared/config/files";
import Column from "primevue/column";
import DataTable from "primevue/datatable";

const store = useStore();
const router = useRouter();

const navigate = function (route) {
  router.push(route);
  // hide tooltip otherwise it persists on navigation
  document.getElementById("vg-tooltip-element").style.display = "none";
};
const eventListener = function (result, route: RouteLocation) {
  return result.view.addEventListener("click", (event, item) => {
    const itemData = item.datum.datum;
    const releaseKey = helpers.getPaddedDate(
      new Date(itemData.release_date),
      ""
    );
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
</script>

<style scoped></style>
