import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import { explorerStore } from "@/widgets/explorer";
import { errorStore } from "@/widgets/error";
import { reportsDataStore } from "@/processes/exploreReports";
import { settingsStore } from "@/widgets/settings";
import { webApiStore } from "@/shared/api/webAPI";
import { snackbarStore } from "@/widgets/snackbar";
import { authStore } from "@/shared/api/authentication";
export default new Vuex.Store({
  modules: {
    explorerStore,
    reportsDataStore,
    errorStore,
    settingsStore,
    webApiStore,
    snackbarStore,
    authStore,
  },
});
