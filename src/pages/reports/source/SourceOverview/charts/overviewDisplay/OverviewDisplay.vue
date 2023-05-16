<template>
  <v-card elevation="10" class="mx-auto pb-6" outlined>
    <v-card-title>Source Overview</v-card-title>
    <v-card-text>
      <v-container fluid>
        <v-row justify="space-around"
          ><v-col class="mx-4" cols="auto">
            <h3 class="mb-4 text--center">Releases</h3>
            <h1 class="text-center">
              {{ getReleasesCount
              }}<v-icon large color="primary" class="mx-2">mdi-history</v-icon>
            </h1>
          </v-col>
          <v-col class="mx-4" cols="auto">
            <h3 class="mb-4 text-center">Average Days Between Releases</h3>
            <h1 class="text-center">
              {{ getDaysBetweenReleases.toFixed(0)
              }}<v-icon large color="primary" class="mx-2"
                >mdi-clock-outline</v-icon
              >
            </h1>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";

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
