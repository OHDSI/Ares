import Vue from "vue";
import App from "./App.vue";
import store from "./data/store";
import router from "./router";
import vuetify from "@/plugins/vuetify";
import sync from "./services/vuex-router-sync";

import { LOAD_FROM_STORAGE } from "@/data/store/modules/settings/actions.type";

// adds reactive router module to global state
sync(store, router);

store.dispatch(LOAD_FROM_STORAGE);

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount("#app");
