<template>
  <v-app>
    <v-container main fluid class="pt-4 pl-2 pr-2 mb-16 main">
      <router-view name="main" />
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { errorActions } from "@/widgets/error";
import { webApiActions } from "@/shared/api/webAPI";

import { useStore } from "vuex";
import { useRoute } from "vue-router";

const store = useStore();
const route = useRoute();

import { computed, watch, onBeforeMount } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();

const darkMode = computed(function (): boolean {
  return store.getters.getSettings.darkMode;
});

const activeTheme = computed(function (): boolean {
  return store.getters.getSettings.theme;
});
watch(darkMode, (): void => {
  theme.global.name.value = `${store.getters.getSettings.theme}${
    store.getters.getSettings.darkMode ? "Dark" : "Light"
  }`;
});
watch(activeTheme, (): void => {
  theme.global.name.value = `${store.getters.getSettings.theme}${
    store.getters.getSettings.darkMode ? "Dark" : "Light"
  }`;
});

watch(route, (): void => {
  store.dispatch(errorActions.RESET_ERRORS);
  store.dispatch(webApiActions.RESET_API_STORAGE);
});

onBeforeMount((): void => {
  theme.global.name.value = `${store.getters.getSettings.theme}${
    store.getters.getSettings.darkMode ? "Dark" : "Light"
  }`;
});
</script>

<style lang="scss">
.main {
  width: 95%;
}

.hidden {
  display: none;
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
  background: rgba(var(--v-theme-surface-variant), 1) !important;
  color: rgb(var(--v-theme-on-surface-variant));
  z-index: 1000;
}

a {
  color: rgb(var(--v-theme-primary));
}

.v-autocomplete__selection {
  max-width: 100% !important;
}

.v-checkbox .v-selection-control {
  min-height: 1rem !important;
}

a:visited {
  color: rgb(var(--v-theme-primary-lighten-2));
}

.v-tooltip .v-overlay__content {
  background: rgba(var(--v-theme-surface-variant), 1) !important;
}
</style>
