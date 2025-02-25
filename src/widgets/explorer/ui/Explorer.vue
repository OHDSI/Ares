<template>
  <div
    v-if="store.getters.explorerLoaded"
    id="explorer"
    :class="{
      container: true,
      flex: true,
      'flex-row': true,
      'gap-16': true,
      'p-2': true,
      'pb-3': true,
      'pt-6': true,
      'items-end': true,
      'content-center': true,
      sticky: isSticky,
    }"
  >
    <Button class="logo-button" text @click="router.push('/')">
      <img :class="iconClass" :src="icon" alt="Ares logo" width="45" />
    </Button>
    <div class="flex flex-row gap-5 items-end">
      <FloatLabel>
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
        <label class="font-light dark:text-white text-black" for="folder"
          >Report category</label
        >
      </FloatLabel>

      <FloatLabel v-if="showSourceSelector">
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
      </FloatLabel>

      <FloatLabel v-if="showReleaseSelector">
        <dropdown
          input-id="release"
          :model-value="store.getters.getSelectedRelease"
          @update:modelValue="changeRelease"
          :options="store.getters.getReleases"
          optionLabel="release_name"
        >
        </dropdown>
        <label
          class="relative left-3 top-0 font-light dark:text-white text-black"
          for="release"
          >Release</label
        >
      </FloatLabel>
      <FloatLabel>
        <CascadeSelect
          input-id="report"
          :options="store.getters.getFilteredReports"
          :model-value="store.getters.getSelectedReport"
          @update:modelValue="changeReport"
          optionLabel="name"
          optionGroupLabel="name"
          :optionGroupChildren="['reports']"
        >
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <svg-icon type="mdi" :path="slotProps.option.icon"></svg-icon>
              <div>{{ slotProps.option.name }}</div>
            </div>
          </template>
        </CascadeSelect>
        <label class="font-light dark:text-white text-black" for="concept"
          >Report</label
        >
      </FloatLabel>
      <FloatLabel v-if="showConceptSelector">
        <dropdown
          input-id="concept"
          :model-value="showConceptSelector"
          :options="[showConceptSelector]"
          disabled
        />
        <label class="font-light dark:text-white text-black" for="concept"
          >Concept ID</label
        >
      </FloatLabel>
      <FloatLabel v-if="showCohortSelector">
        <dropdown
          input-id="cohort"
          :model-value="showCohortSelector"
          :options="[showCohortSelector]"
          disabled
        />
        <label class="font-light dark:text-white text-black" for="cohort"
          >Cohort ID</label
        >
      </FloatLabel>
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
import CascadeSelect from "primevue/cascadeselect";
import FloatLabel from "primevue/floatlabel";

const route = useRoute();
const store = useStore();
const router = useRouter();

const iconClass = computed((): string => {
  return store.getters.getSettings.darkMode ? "" : "inverted";
});
const isSticky = computed(() => {
  return store.getters.getSettings.stickyNavBar;
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

<style scoped lang="scss">
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
.sticky {
  position: fixed;
  top: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  .dark & {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  }
}

#explorer {
  width: 100vw;
  max-width: 100%;
  z-index: 1000;
  @apply dark:bg-surface-900 bg-white;
  box-sizing: border-box;
}
</style>
