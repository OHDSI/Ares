import App from "./app/App.vue";
import CollapseTransition from "@/shared/ui/collapseTransition/CollapseTransition.vue";
import { createApp } from "vue";
import "@/style.css";

import store from "./app/providers/store";
import router from "./app/providers/router";
import sync from "./shared/lib/vuex-router-sync";
import environment from "@/shared/api/environment";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";

import { settingsActions } from "@/widgets/settings";
import "primeicons/primeicons.css";
import clickOutside from "@/shared/lib/directives/clickOutside";
import Tooltip from "primevue/tooltip";

import { tailwindTheme } from "@/app/plugins/tailwind/tailwindStyles";
import ConfirmationService from "primevue/confirmationservice";
// Pre-inject VirtualScrollerStyle and then neutralise loadStyle so that
// VirtualScroller's beforeMount never mutates the <style> tag's textContent.
// In Chromium, even an identical textContent reassignment on a <style> element
// containing @layer rules triggers a full cascade recalculation, which causes
// all page text to jerk on every Dropdown open.
import VirtualScrollerStyle from "primevue/virtualscroller/style";
VirtualScrollerStyle.loadStyle();
VirtualScrollerStyle.loadStyle = () => ({});
import resize from "@/shared/lib/directives/resize";
import { errorActions } from "@/widgets/error";
import errorMessages from "@/widgets/error/model/config/errorMessages";
// adds reactive router module to global state

sync(store, router);
environment.load().then(() => {
  store.dispatch(settingsActions.LOAD_SETTINGS_FROM_STORAGE).then(() => {
    const app = createApp(App);
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
    app
      .component("CollapseTransition", CollapseTransition)
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
