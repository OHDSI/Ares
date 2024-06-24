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

import { settingsActions } from "@/widgets/settings";
import "primeicons/primeicons.css";
import clickOutside from "@/shared/lib/directives/clickOutside";
import Tooltip from "primevue/tooltip";

import { tailwindTheme } from "@/app/plugins/tailwind/tailwindStyles";
import ConfirmationService from "primevue/confirmationservice";
import resize from "@/shared/lib/directives/resize";
import { errorActions } from "@/widgets/error";
import errorMessages from "@/widgets/error/model/config/errorMessages";

// adds reactive router module to global state
sync(store, router);

async function initializeEnvironment() {
  await environment.load();
}

async function initializeAuth() {
  await store.dispatch(authActions.GET_AUTH_TOKEN);
  await store.dispatch(authActions.GET_USER);
}

async function initializeSettings() {
  await store.dispatch(settingsActions.LOAD_SETTINGS_FROM_STORAGE);
}

function initializeErrorHandler(app) {
  app.config.errorHandler = (err) => {
    // Handle the error globally
    store.dispatch(errorActions.NEW_ERROR, {
      userMessage: errorMessages.technicalError.codeError,
      name: err.name,
      details: err.message,
      stack: err.stack,
      type: "unexpected",
    });
  };
}

function initializeDirectives(app) {
  app
    .directive("click-outside", clickOutside)
    .directive("resize", resize)
    .directive("tooltip", Tooltip);
}

function initializePlugins(app) {
  app
    .use(store)
    .use(router)
    .use(PrimeVue, { pt: tailwindTheme })
    .use(ConfirmationService)
    .use(ToastService);
}

initializeEnvironment().then(() => {
  initializeAuth()
    .catch()
    .finally(() => {
      initializeSettings().then(() => {
        const app = createApp(App);
        initializeErrorHandler(app);
        initializeDirectives(app);
        initializePlugins(app);
        app.mount("#app");
      });
    });
});
