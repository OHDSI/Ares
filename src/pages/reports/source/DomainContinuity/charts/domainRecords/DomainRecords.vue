<template>
  <Panel
    header="Domain Continuity"
    v-if="!store.getters.getErrors & store.getters.dataInStore"
  >
    <Chart
      id="viz-continuity"
      :chartSpec="specOverview"
      :data="store.getters.getData.domainRecords"
      :listener="eventListener"
    />
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
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";

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
</script>

<style scoped></style>
