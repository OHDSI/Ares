import Vue from "vue";
import App from "./App.vue";
import store from "./data/store";
import router from "./router";
import vuetify from "@/plugins/vuetify";
import sync from "./services/vuex-router-sync";

sync(store, router);

new Vue({
  vuetify,
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
