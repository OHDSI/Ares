import { Store } from "vuex";

import { explorerStore } from "@/widgets/explorer";
import { errorStore } from "@/widgets/error";
import { reportsDataStore } from "@/processes/exploreReports";
import { settingsStore } from "@/widgets/settings";
import { webApiStore, authStore } from "@/shared/api/webAPI";
import { snackbarStore } from "@/widgets/snackbar";
export default new Store({
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
