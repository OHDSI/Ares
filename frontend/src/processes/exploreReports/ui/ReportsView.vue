<template>
  <div
    v-if="!store.getters.getErrors && store.getters.dataInStore"
    class="mt-10 mb-16"
  >
    <router-view name="reportsView" />
  </div>
  <div
    v-if="!store.getters.dataInStore && !store.getters.getErrors"
    class="flex flex-col gap-2 justify-center items-center content-center h-[70vh]"
  >
    <ProgressCircle />
  </div>
  <BottomNav />

  <!-- Conditional components />-->
  <Snackbar />
  <Error v-if="store.getters.getErrors" />
  <Settings />
  <SelectionEditDialog
    @close="store.commit(SET_DIALOG, false)"
    v-if="store.getters.getDialogData.show"
    :show="store.getters.getDialogData.show"
    :action="store.getters.getDialogData.action"
    :data="store.getters.getDialogData.data"
    :form-title="'Edit selection'"
  />
</template>

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
import {
  LOAD_API_NOTES,
  LOAD_NOTES,
} from "@/widgets/notesPanel/model/store/actions.type";
import getDuckDBTables from "@/shared/api/duckdb/conceptTables";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import SelectionEditDialog from "@/widgets/selectionEditDialog/ui/selectionEditDialog.vue";
import ProgressCircle from "@/entities/ProgressCircle.vue";
import environment from "@/shared/api/environment";
import { pageCharts } from "@/processes/exploreReports/config/pageCharts";

const route = useRoute();
const store = useStore();

const path = computed(function () {
  return route.path;
});

const webApiEnabled = environment.WEB_API_ENABLED;
const loggedIn = store.getters.getWebAPIUser;
const useAnnotationsApi = environment.USE_ANNOTATIONS_API;

const useAnnotationsBackend = webApiEnabled
  ? loggedIn && useAnnotationsApi
  : useAnnotationsApi;

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
  if (!useAnnotationsBackend) {
    store.dispatch(LOAD_NOTES);
  } else {
    store.dispatch(LOAD_API_NOTES, pageCharts[route.name]);
  }
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
      if (!useAnnotationsBackend) {
        store.dispatch(LOAD_NOTES);
      } else {
        store.dispatch(LOAD_API_NOTES, pageCharts[route.name]);
      }
    });
});
</script>

<style scoped></style>
