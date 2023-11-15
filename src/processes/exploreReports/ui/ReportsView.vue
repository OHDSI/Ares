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
import NewNote from "@/widgets/selectionEditDialog/newNote.vue";
import { LOAD_NOTES } from "@/widgets/notesPanel/model/store/actions.type";
import getDuckDBTables from "@/shared/api/duckdb/conceptTables";

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
  const view = getFilesByView({
    files: getDuckDBTables()[route.params.domain],
  })[route.name];
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
    .then(() => {
      loadViewData();
      store.dispatch(LOAD_NOTES);
    });
});
</script>

<style scoped></style>
