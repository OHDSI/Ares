<template>
  <Panel header="Data Network Overview">
    <div class="flex flex-row justify-evenly">
      <div class="flex flex-col gap-3 items-center content-center">
        <h3>Data Sources</h3>
        <div class="flex flex-row items-center gap-3">
          <h1 class="text-xl">{{ store.getters.getSources.length }}</h1>
          <svg-icon :size="46" type="mdi" :path="mdiDatabase"></svg-icon>
        </div>
      </div>
      <div class="flex flex-col gap-3 items-center content-center">
        <h3>People</h3>
        <div class="flex flex-row items-center gap-3">
          <h1 class="text-xl">{{ personCountFormatter(countPeople) }}</h1>
          <svg-icon :size="46" type="mdi" :path="mdiAccount"></svg-icon>
        </div>
      </div>
      <div class="flex flex-col gap-3 items-center content-center">
        <h3>Data Quality Issues</h3>
        <div class="flex flex-row items-center gap-3">
          <h1 class="text-xl">{{ countDataQualityIssues }}</h1>
          <svg-icon :size="46" type="mdi" :path="mdiDatabaseAlert"></svg-icon>
        </div>
      </div>
      <div class="flex flex-col gap-3 items-center content-center">
        <h3>Data Source Releases</h3>
        <div class="flex flex-row items-center gap-3">
          <h1 class="text-xl">{{ countDataSourceReleases }}</h1>
          <svg-icon :size="46" type="mdi" :path="mdiHistory"></svg-icon>
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { computed } from "vue";
import * as d3 from "d3-format";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { mdiAccount, mdiDatabase, mdiDatabaseAlert, mdiHistory } from "@mdi/js";
import SvgIcon from "@jamescoyle/vue-icon";
import Panel from "primevue/panel";

const store = useStore();

const countDataSourceReleases = computed(function () {
  if (store.getters.explorerLoaded) {
    return store.getters.getSources.reduce(
      (prev, current) => (prev += current.releases.length),
      0
    );
  } else {
    return [];
  }
});

const countDataQualityIssues = computed(function () {
  if (store.getters.explorerLoaded) {
    return store.getters.getSources.reduce(
      (prev, current) =>
        (prev += current.releases[0].count_data_quality_issues),
      0
    );
  } else {
    return [];
  }
});

const countPeople = computed(function () {
  if (store.getters.explorerLoaded) {
    return store.getters.getSources.reduce(
      (prev, current) => (prev += current.releases[0].count_person),
      0
    );
  } else {
    return [];
  }
});

const personCountFormatter = function (count: number) {
  return d3.format(".3s")(count);
};
</script>

<style scoped></style>
