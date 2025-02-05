<template>
  <Panel header="Data Strands">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <div
      v-if="store.getters.getData"
      id="viz-sourcedatastrand"
      class="viz-container"
    ></div>
    <div v-if="showTable" class="p-4">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
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
import { watch, computed, ref, onMounted } from "vue";
import * as vega from "vega";
import { useStore } from "vuex";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { Handler } from "vega-tooltip";
import { darkTheme, lightTheme } from "@/widgets/chart/model/themes";

const store = useStore();
const route = useRoute();
const router = useRouter();

import { specDatastrand } from "./specDatastrand";
import { links } from "@/shared/config/links";
import { useRoute, useRouter } from "vue-router";

const specs = ref(specDatastrand);

const parsedConfig = computed(() => {
  return {
    ...specs.value,
    config: store.getters.getSettings.darkMode ? darkTheme : lightTheme,
  };
});

const renderChart = function () {
  const view = new vega.View(vega.parse(parsedConfig.value, {}), {
    renderer: "svg",
    container: `#viz-sourcedatastrand`,
    hover: true,
  }).tooltip(new Handler().call);
  view.runAsync().then(() => {
    view.addSignalListener("selectDomain", (name, value) => {
      const domainKey = value.domain.toLowerCase().replace(" ", "_");
      router.push({
        name: "domainTable",
        params: {
          cdm: route.params.cdm_source_key,
          release: value.cdm_release_key.split("-").join(""),
          domain: domainKey,
        },
      });
      document.getElementById("vg-tooltip-element").style.display = "none";
    });
  });
};

const data = computed(() => store.getters.getData);

const darkMode = computed(() => store.getters.getSettings.darkMode);

onMounted(() => {
  if (data.value) {
    const spec = specDatastrand;
    spec.data[0].values = data.value.dataStrandReport;
    specs.value = spec;

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
