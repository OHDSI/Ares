<template>
  <Transition name="page-fade">
    <div
      v-if="!store.getters.getErrors && loaderState === 'idle'"
      class="mt-10 mb-16"
    >
      <router-view name="reportsView" />
    </div>
  </Transition>
  <div
    v-if="loaderState !== 'idle' && !store.getters.getErrors"
    class="flex flex-col gap-2 justify-center items-center content-center h-[70vh]"
  >
    <BlackHoleLoading
      :escalate="true"
      text="Fetching..."
      size="lg"
      :state="loaderState"
    />
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

import { watch, computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  LOAD_API_NOTES,
  LOAD_NOTES,
} from "@/widgets/notesPanel/model/store/actions.type";
import getDuckDBTables from "@/shared/api/duckdb/conceptTables";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import SelectionEditDialog from "@/widgets/selectionEditDialog/ui/selectionEditDialog.vue";
import ProgressCircle from "@/shared/ui/ProgressCircle.vue";
import environment from "@/shared/api/environment";
import { pageCharts } from "@/processes/exploreReports/config/pageCharts";
import BlackHoleLoading from "@/shared/assets/BlackHoleLoading.vue";

const route = useRoute();
const store = useStore();

const loaderState = ref(store.getters.dataInStore ? "idle" : "loading");
let loadStart = Date.now();

watch(
  () => store.getters.dataInStore,
  async (val) => {
    if (val) {
      if (Date.now() - loadStart >= 600) {
        loaderState.value = "success";
        await new Promise((r) => setTimeout(r, 1100));
      }
      loaderState.value = "idle";
    } else {
      loadStart = Date.now();
      loaderState.value = "loading";
    }
  }
);

const path = computed(function () {
  return JSON.stringify({
    name: route.name,
    params: {
      // concept: route.params.concept,
      cdm: route.params.cdm,
      release: route.params.release,
      domain: route.params.domain,
    },
  });
});

const webApiEnabled = environment.WEB_API_ENABLED;
const loggedIn = store.getters.getSettings.user;
const useAnnotationsApi = environment.USE_ANNOTATIONS_API;

const useAnnotationsBackend = webApiEnabled
  ? loggedIn && useAnnotationsApi
  : useAnnotationsApi;

const loadViewData = function () {
  const view = getFilesByView({
    files: getDuckDBTables()[route.params.domain?.toLowerCase()],
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

<style scoped>
.page-fade-leave-active {
  transition: opacity 0.1s ease;
}
.page-fade-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
.page-fade-enter-from {
  transform: translateY(6px);
}
</style>
