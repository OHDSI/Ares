<template>
  <Panel header="Source Overview">
    <div class="flex flex-row justify-evenly">
      <div class="flex flex-col gap-3 items-center content-center">
        <h3>Releases</h3>
        <div class="flex flex-row items-center gap-3">
          <h1 class="text-xl">{{ getReleasesCount }}</h1>
          <svg-icon :size="46" type="mdi" :path="mdiHistory"></svg-icon>
        </div>
      </div>
      <div class="flex flex-col gap-3 items-center content-center">
        <h3>Average days between releases</h3>
        <div class="flex flex-row items-center gap-3">
          <h1 class="text-xl">{{ getDaysBetweenReleases.toFixed(0) }}</h1>
          <svg-icon :size="46" type="mdi" :path="mdiClockOutline"></svg-icon>
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import SvgIcon from "@jamescoyle/vue-icon";
import Panel from "primevue/panel";
import { mdiClockOutline, mdiHistory } from "@mdi/js";

const store = useStore();

const getReleasesCount = computed(function () {
  if (store.getters.explorerLoaded) {
    return store.getters.getSelectedSource.count_releases;
  } else {
    return [];
  }
});

const getDaysBetweenReleases = computed(function () {
  if (store.getters.explorerLoaded) {
    const dates = store.getters.getSelectedSource.releases.map(
      (value) => new Date(value.release_name)
    );
    //todo rewrite using array functional methods
    const numbers = [];

    for (let i = 0; i < dates.length - 1; i++) {
      numbers.push((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
    }

    return numbers.length
      ? numbers.reduce((prevValue, current) => prevValue + current, 0) /
          numbers.length
      : 0;
  } else {
    return [];
  }
});
</script>

<style scoped></style>
