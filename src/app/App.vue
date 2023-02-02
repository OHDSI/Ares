<template>
  <v-app>
    <v-container main fluid class="pt-4 pl-2 pr-2 mb-16 main">
      <router-view name="main" />
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { errorActions } from "@/widgets/error";

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

watch(darkMode, (): void => {
  theme.global.name.value = store.getters.getSettings.darkMode
    ? "dark"
    : "light";
});

watch(route, (): void => {
  store.dispatch(errorActions.RESET_ERRORS);
});

onBeforeMount((): void => {
  theme.global.name.value = store.getters.getSettings.darkMode
    ? "dark"
    : "light";
});
</script>

<style scoped>
.main {
  width: 95%;
}
:deep(.v-list-item__title) {
  font-size: 0.75rem !important;
}
</style>
