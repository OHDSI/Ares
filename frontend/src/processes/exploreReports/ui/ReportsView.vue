<template>
  <router-view name="reportsView" v-slot="{ Component }">
    <Transition name="page-fade">
      <div
        v-if="
          !store.getters.getErrors &&
          loaderState === 'idle' &&
          store.getters.dataInStore
        "
        class="mt-10 mb-16"
      >
        <component :is="Component" />
      </div>
    </Transition>
  </router-view>
  <div
    v-if="loaderState !== 'idle' && !store.getters.getErrors"
    class="flex flex-col gap-2 justify-center items-center content-center h-[70vh]"
  >
    <BlackHoleLoader
      :escalate="true"
      text="Fetching..."
      size="lg"
      :state="loaderState"
    />
  </div>

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

import { RESET_DATA_STORAGE } from "../model/store/actions.type";
import getFilesByView from "../config/dataLoadConfig";

import { useStore } from "vuex";

import { watch, computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { isNavigating } from "@/app/providers/router/navigationState";
import {
  LOAD_API_NOTES,
  LOAD_NOTES,
} from "@/widgets/notesPanel/model/store/actions.type";
import getDuckDBTables from "@/shared/api/duckdb/conceptTables";
import { SET_DIALOG } from "@/widgets/notesPanel/model/store/mutations.type";
import SelectionEditDialog from "@/widgets/selectionEditDialog";
import environment from "@/shared/api/environment";
import { pageCharts } from "@/processes/exploreReports/config/pageCharts";
import BlackHoleLoader from "@/shared/ui/blackHoleLoader";

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
      // When route name changes, :key="route.name" remounts this component and the
      // new instance initialises its own loader state. Skip here to avoid a brief
      // flash in the outgoing instance during its leave transition.
      if (isNavigating.value) return;
      loadStart = Date.now();
      loaderState.value = "loading";
    }
  },
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
  transition: opacity 0.12s ease;
}
.page-fade-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s cubic-bezier(0.2, 0, 0, 1);
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
.page-fade-enter-from {
  transform: scale(0.97);
}
</style>
