<template>
  <v-container fluid>
    <Explorer v-if="showExplorer" />
    <Error v-if="store.getters.getErrors" />
    <router-view v-if="!store.getters.getErrors" name="reportsView" />
    <Snackbar />
    <Settings />
    <BottomNav />
  </v-container>
</template>

<script lang="ts">
export default {
  name: "ReportsView",
};
</script>
<script setup lang="ts">
import { Error } from "@/widgets/error";
import { Explorer, explorerActions } from "@/widgets/explorer";
import { Settings } from "@/widgets/settings";
import { Snackbar } from "@/widgets/snackbar";
import BottomNav from "@/widgets/bottomNav";

import { RESET_DATA_STORAGE } from "../model/store/actions.type";
import getFilesByView from "../config/dataLoadConfig";

import { useStore } from "vuex";

import { watch, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const store = useStore();

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

const loadViewData = function () {
  const view = getFilesByView()[route.name];
  if (view) {
    store.dispatch(view.loadMethod, view.payload);
  }
};

watch(path, () => {
  store.dispatch(RESET_DATA_STORAGE);
  loadViewData();
});

onMounted(() => {
  store.dispatch(explorerActions.FETCH_QUERY_INDEX, {
    route: route.params,
  });
  store
    .dispatch(explorerActions.FETCH_INDEX, { route: route.params })
    .then(() => loadViewData());
});
</script>

<style scoped></style>
