<template>
  <v-container v-if="!store.getters.getErrors" fluid min-width="900">
    <v-card :loading="!store.getters.dataInStore" elevation="2" class="ma-4">
      <ChartHeader title="Data Strands" />
      <div
        v-if="store.getters.getData"
        id="viz-datastrand"
        class="viz-container"
      ></div>
      <v-toolbar density="compact" class="mt-6">
        <ChartActionIcon
          icon="mdi-help-circle"
          tooltip="Data strands are simple visualizations that describe the composition of
        a data source across the various CDM domain tables. Each individual
        strand shows the percentage of the data source comprised of data from a
        particular domain table. Across the network, the strands can be visually
        compared and contrasted."
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          icon="mdi-code-braces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.DOMAIN_SUMMARY.RECORDS_BY_DOMAIN[0]
              )
            )
          "
        />
      </v-toolbar>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import embed from "vega-embed";
import { watch, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const store = useStore();

import { specDatastrand } from "./specDatastrand";
import { links } from "@/shared/config/links";

const config = specDatastrand;

import { useStore } from "vuex";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

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
