<template>
  <Panel header="Data Strands">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <div
      v-if="store.getters.getData"
      id="viz-datastrand"
      class="viz-container"
    ></div>
    <div v-if="showTable" class="p-4">
      <DataTable
        size="small"
        :value="data.dataStrandReport"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column field="domain" header="Domain"> </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Number of Records"
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
          tooltip="Data strands are simple visualizations that describe the composition of
            a data source across the various CDM domain tables. Each individual
            strand shows the percentage of the data source comprised of data from a
            particular domain table. Across the network, the strands can be visually
            compared and contrasted."
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
import embed from "vega-embed";
import { watch, computed, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const store = useStore();

import { specDatastrand } from "./specDatastrand";
import { links } from "@/shared/config/links";

const config = specDatastrand;

import { useStore } from "vuex";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";

const renderChart = function () {
  embed("#viz-datastrand", config, {
    theme: store.getters.getSettings.darkMode ? "dark" : "",
  }).then((result) => {
    result.view.addSignalListener("selectDomain", (name, value) => {
      const domainKey = value.domain.toLowerCase().replace(" ", "_");
      router.push({
        name: "domainTable",
        params: {
          cdm: value.cdm_source_key,
          release: value.cdm_release_key,
          domain: domainKey,
        },
      });
      document.getElementById("vg-tooltip-element").style.display = "none";
    });
  });
};

const data = computed(() => store.getters.getData);

const darkMode = computed(() => store.getters.getSettings.darkMode);

watch(data, function () {
  if (data.value) {
    config.data[0].values = data.value.dataStrandReport;
    renderChart();
  }
});

watch(darkMode, () => {
  renderChart();
});

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}
</script>

<style scoped>
.viz-container {
  width: 95%;
}
</style>
