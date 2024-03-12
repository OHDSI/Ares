<template>
  <div
    v-if="store.getters.explorerLoaded"
    id="explorer"
    class="container flex flex-row gap-16 my-10 items-center"
  >
    <Button class="logo-button" text @click="router.push('/')">
      <img :class="iconClass" :src="icon" alt="Ares logo" width="45" />
    </Button>
    <div class="flex flex-row gap-5">
      <div class="p-float-label">
        <dropdown
          inputId="folder"
          :model-value="store.getters.getSelectedFolder"
          @update:modelValue="changeFolder"
          :options="config.folders"
          optionLabel="name"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <svg-icon type="mdi" :path="slotProps.option.icon"></svg-icon>
              <div>{{ slotProps.option.name }}</div>
            </div>
          </template>
        </dropdown>
        <label class="left-3 font-light dark:text-white text-black" for="folder"
          >Report category</label
        >
      </div>

      <div v-if="showSourceSelector" class="p-float-label">
        <dropdown
          input-id="source"
          :model-value="store.getters.getSelectedSource"
          @update:modelValue="changeSource"
          :options="store.getters.getSources"
          optionLabel="cdm_source_abbreviation"
        >
        </dropdown>
        <label class="left-3 font-light dark:text-white text-black" for="source"
          >Source</label
        >
      </div>

      <div v-if="showReleaseSelector" class="p-float-label">
        <dropdown
          input-id="release"
          :model-value="store.getters.getSelectedRelease"
          @update:modelValue="changeRelease"
          :options="store.getters.getReleases"
          optionLabel="release_name"
        >
        </dropdown>
        <label
          class="left-3 font-light dark:text-white text-black"
          for="release"
          >Release</label
        >
      </div>

      <div class="p-float-label">
        <dropdown
          input-id="report"
          :model-value="store.getters.getSelectedReport"
          @update:modelValue="changeReport"
          :options="store.getters.getFilteredReports"
          optionLabel="name"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <svg-icon type="mdi" :path="slotProps.option.icon"></svg-icon>
              <div>{{ slotProps.option.name }}</div>
            </div>
          </template>
        </dropdown>
        <label class="left-3 font-light dark:text-white text-black" for="report"
          >Report</label
        >
      </div>

      <div v-if="showConceptSelector" class="p-float-label">
        <dropdown
          input-id="concept"
          :model-value="showConceptSelector"
          :options="[showConceptSelector]"
          disabled
        />
        <label
          class="left-3 font-light dark:text-white text-black"
          for="concept"
          >Concept ID</label
        >
      </div>
      <div v-if="showCohortSelector" class="p-float-label">
        <dropdown
          input-id="cohort"
          :model-value="showCohortSelector"
          :options="[showCohortSelector]"
          disabled
        />
        <label class="left-3 font-light dark:text-white text-black" for="cohort"
          >Cohort ID</label
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import icon from "@/shared/assets/icon.png";
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import Dropdown from "primevue/dropdown";
import SvgIcon from "@jamescoyle/vue-icon";
import Button from "primevue/button";

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
  const folder = store.getters.getSelectedFolder;
  const release = folder.key === "cdm" ? data.releases[0].release_id : null;
  router.push({
    params: {
      ...route.params,
      cdm: data.cdm_source_key,
      release,
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
  let cdm, release;
  if (data.key === "datasource") {
    cdm = store.getters.getSelectedSource
      ? store.getters.getSelectedSource.cdm_source_key
      : store.getters.getSources[0].cdm_source_key;
  }
  if (data.key === "cdm") {
    cdm = store.getters.getSelectedSource
      ? store.getters.getSelectedSource.cdm_source_key
      : store.getters.getSources[0].cdm_source_key;
    release = store.getters.getSelectedSource
      ? store.getters.getSelectedRelease.release_id
      : store.getters.getSources[0].releases[0].release_id;
  }

  router.push({
    name: data.key,
    params: {
      cdm,
      release,
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

const showCohortSelector = computed(function (): string | string[] {
  return route.params.cohort_id;
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
.v-list-item {
  min-height: 30px !important;
}
.logo-button {
  opacity: 0.5;
  transition: 0.3s;
}

.logo-button:hover {
  opacity: 1;
  transition: 0.3s;
}
</style>
