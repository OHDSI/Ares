<template>
  <Explorer class="min-w-[1250px] px-28" v-if="showExplorer" />

  <SqlDebugWidget v-if="devWidget" />

  <div class="px-3 min-w-[1250px]">
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
import { computed, watch, onBeforeMount } from "vue";
import {
  GET_USER,
  LOG_OUT,
} from "@/shared/api/webAPI/authentication/model/store/actions.type";
import LocalStorageService from "@/shared/api/localStorageService";
const store = useStore();
const route = useRoute();
import { Explorer } from "@/widgets/explorer";
import SqlDebugWidget from "@/widgets/debugWidget";

const favicon = document.getElementById("faviconTag");

const darkMode = computed(function (): boolean {
  return store.getters.getSettings.darkMode;
});

const devWidget = computed(() => store.getters.getSettings.devWidget);

const path = computed(function () {
  return route.path;
});

const showExplorer = computed(function () {
  return (
    path.value.includes("network") ||
    path.value.includes("cdm") ||
    path.value.includes("datasource") ||
    path.value.includes("characterization")
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
.vg-tooltip {
  z-index: 999999 !important;
}
html {
  font-size: 14px;
}

html:not(.dark) {
  --doc-scrollbar-color: #94a3b8;
  --doc-scrollbar-hover: #94a3b8;
}

html.dark {
  --doc-scrollbar-color: #3a3a3a;
  --doc-scrollbar-hover: #9ca3af;
}

*::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
  margin-top: 8px;
  margin-bottom: 8px;
}

::-webkit-scrollbar-thumb:vertical {
  border-radius: 0;
  background:
    linear-gradient(to bottom right, transparent 49%, var(--doc-scrollbar-color) 51%) 0 0 / 100% 6px no-repeat,
    linear-gradient(var(--doc-scrollbar-color), var(--doc-scrollbar-color)) 0 6px / 100% calc(100% - 12px) no-repeat,
    linear-gradient(to top left, transparent 49%, var(--doc-scrollbar-color) 51%) 0 100% / 100% 6px no-repeat;
}

::-webkit-scrollbar-thumb:vertical:hover {
  background:
    linear-gradient(to bottom right, transparent 49%, var(--doc-scrollbar-hover) 51%) 0 0 / 100% 6px no-repeat,
    linear-gradient(var(--doc-scrollbar-hover), var(--doc-scrollbar-hover)) 0 6px / 100% calc(100% - 12px) no-repeat,
    linear-gradient(to top left, transparent 49%, var(--doc-scrollbar-hover) 51%) 0 100% / 100% 6px no-repeat;
}

::-webkit-scrollbar-thumb:horizontal {
  border-radius: 0;
  background:
    linear-gradient(to bottom right, transparent 49%, var(--doc-scrollbar-color) 51%) 0 0 / 6px 100% no-repeat,
    linear-gradient(var(--doc-scrollbar-color), var(--doc-scrollbar-color)) 6px 0 / calc(100% - 12px) 100% no-repeat,
    linear-gradient(to bottom left, transparent 49%, var(--doc-scrollbar-color) 51%) 100% 0 / 6px 100% no-repeat;
}

::-webkit-scrollbar-thumb:horizontal:hover {
  background:
    linear-gradient(to bottom right, transparent 49%, var(--doc-scrollbar-hover) 51%) 0 0 / 6px 100% no-repeat,
    linear-gradient(var(--doc-scrollbar-hover), var(--doc-scrollbar-hover)) 6px 0 / calc(100% - 12px) 100% no-repeat,
    linear-gradient(to bottom left, transparent 49%, var(--doc-scrollbar-hover) 51%) 100% 0 / 6px 100% no-repeat;
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

.other-user .annotation-subject path {
  fill: #0d65eb;
}

.annotation path {
  stroke: #e8336d;
}

.other-user path {
  stroke: #0d65eb;
}

.annotation text {
  fill: #e8336d;
}

other-user path {
  stroke: #0d65eb;
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

.other-user.above path {
  stroke: #0d65eb;
}

.annotation.above text {
  fill: #e8336d;
}

.other-user.above text {
  fill: #0d65eb;
}

.annotation.anomaly path {
  stroke: #e8336d;
  stroke-width: 2px;
}

.other-user.anomaly path {
  stroke: #0d65eb;
}
.annotation.anomaly text {
  fill: #e8336d;
}

.other-user.anomaly text {
  fill: #0d65eb;
}

.tooltip-field-title {
  font-weight: bold;
}

.annotation-note-bg path {
  fill: red;
}

.other-user .annotation-note-bg path {
  fill: #0d65eb !important;
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
