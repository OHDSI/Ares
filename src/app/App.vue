<template>
  <Explorer class="min-w-[1250px] px-28" v-if="showExplorer" />

  <div
    :class="{
      'px-3': true,
      'pt-20': isSticky,
      'min-w-[1250px]': true,
    }"
  >
    <div class="flex flex-col justify-center px-14 md:px-20 lg:px-24 mx-1">
      <router-view name="main" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { errorActions } from "@/widgets/error";
import { webApiActions } from "@/shared/api/webAPI";

import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { computed, watch, onBeforeMount, onMounted } from "vue";
import {
  GET_USER,
  LOG_OUT,
} from "@/shared/api/webAPI/authentication/model/store/actions.type";
import LocalStorageService from "@/shared/api/localStorageService";
const store = useStore();
const route = useRoute();
import { Explorer } from "@/widgets/explorer";

const favicon = document.getElementById("faviconTag");

const darkMode = computed(function (): boolean {
  return store.getters.getSettings.darkMode;
});

const isSticky = computed(() => {
  return store.getters.getSettings.stickyNavBar;
});

const path = computed(function () {
  return route.path;
});

const showExplorer = computed(function () {
  return (
    path.value.includes("network") ||
    path.value.includes("cdm") ||
    path.value.includes("datasource")
  );
});

function setColorMode() {
  const mode = store.getters.getSettings.darkMode;
  mode
    ? document.documentElement.classList.add("dark")
    : document.documentElement.classList.remove("dark");
  mode
    ? favicon.setAttribute("href", "./favicon-dark.png")
    : favicon.setAttribute("href", "./favicon-light.png");
}
watch(darkMode, (): void => {
  setColorMode();
});

watch(route, (): void => {
  store.dispatch(errorActions.RESET_ERRORS);
  store.dispatch(webApiActions.RESET_API_STORAGE);
});

onBeforeMount((): void => {
  setColorMode();
  store.dispatch(GET_USER);
});

LocalStorageService.watch("bearerToken", (newToken) => {
  if (!newToken) {
    store.dispatch(LOG_OUT);
  }
});
</script>

<style lang="scss">
html {
  font-size: 14px;
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  border-radius: 25px;
}

::-webkit-scrollbar-thumb {
  border-radius: 25px;
}
html:not(.dark) ::-webkit-scrollbar-thumb {
  @apply bg-surface-400;
  border-radius: 25px;
}

html.dark ::-webkit-scrollbar-thumb {
  @apply bg-surface-200;
}

a {
  @apply text-primary-500 dark:text-primary-400 #{!important};
}

a:visited {
  @apply text-primary-400 dark:text-primary-300 #{!important};
}
.main {
  width: 95%;
}

.hidden {
  display: none;
}

.favicon {
  filter: invert(1);
}

.annotation-subject path {
  fill: #e8336d;
}

.annotation path {
  stroke: #e8336d;
}

.annotation text {
  fill: #e8336d;
}

.annotation-subject .handle:nth-child(2) {
  cursor: col-resize !important;
}
.annotation-subject .handle:nth-child(3) {
  cursor: row-resize !important;
}

.annotation.above path {
  stroke: #e8336d;
}

.annotation.above text {
  fill: #e8336d;
}

.annotation.anomaly path {
  stroke: #e8336d;
  stroke-width: 2px;
}

.annotation.anomaly text {
  fill: #e8336d;
}

.tooltip-field-title {
  font-weight: bold;
}

.annotation-note-bg path {
  fill: red;
}

.tooltip {
  background: rgba(var(--surface-900), 1) !important;
  color: rgb(var(--surface-200));
  z-index: 1000;
}

.v-autocomplete__selection {
  max-width: 100% !important;
}

.v-checkbox .v-selection-control {
  min-height: 1rem !important;
}

.v-tooltip .v-overlay__content {
  background: rgba(var(--v-theme-surface-variant), 1) !important;
}
</style>
