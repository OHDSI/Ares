import App from "./app/App.vue";
import { createApp } from "vue";
import "@/style.css";

import store from "./app/providers/store";
import router from "./app/providers/router";
import sync from "./shared/lib/vuex-router-sync";
import environment from "@/shared/api/environment";
import { authActions } from "@/shared/api/webAPI";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";

//todo: Think how to improve auth
import { settingsActions } from "@/widgets/settings";
import "primeicons/primeicons.css";
import clickOutside from "@/shared/lib/directives/clickOutside";
import Tooltip from "primevue/tooltip";

import { tailwindTheme } from "@/app/plugins/tailwind/tailwindStyles";
import ConfirmationService from "primevue/confirmationservice";
import resize from "@/shared/lib/directives/resize";
// adds reactive router module to global state
sync(store, router);

environment.load().then(() => {
  store
    .dispatch(authActions.GET_AUTH_TOKEN)
    .then(() => store.dispatch(authActions.GET_USER))
    .catch()
    .finally(() => {
      store.dispatch(settingsActions.LOAD_SETTINGS_FROM_STORAGE).then(() => {
        createApp(App)
          .directive("click-outside", clickOutside)
          .directive("resize", resize)
          .directive("tooltip", Tooltip)
          .use(store)
          .use(router)
          .use(PrimeVue, { pt: tailwindTheme })
          .use(ConfirmationService)
          .use(ToastService)
          .mount("#app");
      });
    });
});
