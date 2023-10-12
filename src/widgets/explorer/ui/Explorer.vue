<template>
  <div v-if="store.getters.explorerLoaded" id="explorer" class="pa-2">
    <v-row>
      <v-col cols="1" class="d-flex justify-center align-center">
        <v-btn to="/home" icon variant="plain">
          <v-img :class="iconClass" :src="icon" width="42"></v-img> </v-btn
      ></v-col>
      <v-col cols="auto">
        <v-autocomplete
          :model-value="store.getters.getSelectedFolder"
          class="mt-2"
          label="Report Category"
          prepend-icon="mdi-folder"
          return-object
          density="compact"
          variant="underlined"
          :items="config.folders"
          item-title="name"
          item-value="name"
          @update:modelValue="changeFolder"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="item.value.name"
              :append-icon="item.value.icon"
            ></v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col v-if="showSourceSelector" cols="auto">
        <v-autocomplete
          class="mt-2"
          variant="underlined"
          label="Source"
          density="compact"
          :model-value="store.getters.getSelectedSource"
          return-object
          prepend-icon="mdi-database"
          auto-select-first
          :items="store.getters.getSources"
          item-title="cdm_source_abbreviation"
          item-value="cdm_source_key"
          @update:modelValue="changeSource"
        >
        </v-autocomplete>
      </v-col>
      <v-col v-if="showReleaseSelector" cols="auto">
        <v-autocomplete
          class="mt-2"
          variant="underlined"
          density="compact"
          label="Data Source Release"
          :model-value="store.getters.getSelectedRelease"
          return-object
          prepend-icon="mdi-database-clock"
          auto-select-first
          :items="store.getters.getReleases"
          item-title="release_name"
          item-value="release_id"
          @update:modelValue="changeRelease"
        >
        </v-autocomplete>
      </v-col>
      <v-col cols="auto">
        <v-autocomplete
          class="mt-2"
          label="Report"
          density="compact"
          variant="underlined"
          :model-value="store.getters.getSelectedReport"
          return-object
          prepend-icon="mdi-file-chart"
          :items="store.getters.getFilteredReports"
          item-title="name"
          item-value="route"
          @update:modelValue="changeReport"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="item.value.name"
              :append-icon="item.value.icon"
            ></v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col v-if="showConceptSelector" cols="auto">
        <v-autocomplete
          readonly
          variant="underlined"
          density="compact"
          class="mt-2"
          label="Concept ID"
          prepend-icon="mdi-chart-timeline-variant-shimmer"
          :model-value="showConceptSelector"
        ></v-autocomplete>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
export default {
  name: "ReportsExplorer",
};
</script>
<script setup lang="ts">
import { useStore } from "vuex";
import icon from "@/shared/assets/icon.png";
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";

import config from "@/widgets/explorer/config";
import {
  Source,
  SourceRelease,
} from "@/processes/exploreReports/model/interfaces/files/SourceIndex";

const route = useRoute();
const store = useStore();
const router = useRouter();

const iconClass = computed((): string => {
  return store.getters.getSettings.darkMode ? "" : "inverted";
});

function changeSource(data: Source): void {
  router.push({
    params: {
      ...route.params,
      cdm: data.cdm_source_key,
      release: data.releases[0].release_id,
    },
  });
}
function changeRelease(data: SourceRelease): void {
  router.push({
    params: {
      ...route.params,
      release: data.release_id,
    },
  });
}
function changeFolder(data): void {
  router.push({
    name: data.key,
    params: {
      cdm: store.getters.getSelectedSource
        ? store.getters.getSelectedSource.cdm_source_key
        : store.getters.getSources[0].cdm_source_key,
      release: store.getters.getSelectedSource
        ? store.getters.getSelectedRelease.release_id
        : store.getters.getSources[0].releases[0].release_id,
    },
  });
}
function changeReport(data): void {
  router.push({
    name: data.routeName,
    params: {
      ...route.params,
      domain: data.domain,
      concept: "",
    },
  });
}

const showConceptSelector = computed(function (): string | string[] {
  return route.params.concept;
});
const showSourceSelector = computed(function (): boolean {
  return (
    store.getters.getSelectedFolder.key === "datasource" ||
    store.getters.getSelectedFolder.key === "cdm"
  );
});
const showReleaseSelector = computed(function (): boolean {
  return store.getters.getSelectedFolder.key === "cdm";
});
</script>

<style scoped>
tr:hover {
  background-color: transparent !important;
}
.v-input {
  font-size: 14px;
}
.inverted {
  filter: invert(1);
}
 .v-list-item{
   min-height: 30px !important;
 }
</style>
