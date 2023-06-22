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

a {
  color: rgb(var(--v-theme-primary));
}

a:visited {
  color: rgb(var(--v-theme-primary-lighten-2));
}

.v-tooltip .v-overlay__content {
  background: rgba(var(--v-theme-surface-variant), 1) !important;
}
</style>
