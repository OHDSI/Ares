import Vue from "vue";
import App from "./app/App.vue";
import store from "./app/providers/store";
import router from "./app/providers/router";
import vuetify from "@/app/plugins/vuetify";
import sync from "./shared/lib/vuex-router-sync";
import { settingsActions } from "@/widgets/settings";
import environment from "@/shared/api/environment";
import { authActions } from "@/shared/api/webAPI";

environment.load().then(() => {
  sync(store, router);
  //loads app settings from the local storage (if there are any saved)
  store.dispatch(settingsActions.LOAD_SETTINGS_FROM_STORAGE);
  store
    .dispatch(authActions.GET_AUTH_TOKEN)
    .then(() => {})
    .catch(() => {})
    .finally(() => {
      new Vue({
        vuetify,
        router,
        store,
        render: (h) => h(App),
      }).$mount("#app");
    });
});
// adds reactive router module to global state
