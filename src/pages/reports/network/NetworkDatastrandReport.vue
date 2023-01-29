<template>
  <v-container v-if="!store.getters.getErrors" fluid min-width="900">
    <v-card
      :loading="!store.getters.dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <v-card-title>Data Strands</v-card-title>
      <div
        v-if="store.getters.getData"
        id="viz-datastrand"
        class="viz-container"
      ></div>
      <info-panel
        details="Data strands are simple visualizations that describe the composition of
        a data source across the various CDM domain tables. Each individual
        strand shows the percentage of the data source comprised of data from a
        particular domain table. Across the network, the strands can be visually
        compared and contrasted."
      ></info-panel>
      <InfoPanel
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        details="View export query."
        :link-details="true"
        :link="
          links.getSqlQueryLink(
            store.getters.getQueryIndex.DOMAIN_SUMMARY.RECORDS_BY_DOMAIN[0]
          )
        "
        :divider="false"
      ></InfoPanel>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import embed from "vega-embed";
import { watch, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const store = useStore();

import InfoPanel from "../../../widgets/infoPanel";
import { chartConfigs } from "@/widgets/chart";
import { links } from "@/shared/config/links";

const config = chartConfigs.specDatastrand;

import { useStore } from "vuex";

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
    config.data[0].values = data.value;
    renderChart();
  }
});

watch(darkMode, () => {
  renderChart();
});
</script>

<style scoped>
.viz-container {
  width: 95%;
}
</style>
