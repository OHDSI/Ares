import App from "./app/App.vue";
import { createApp } from "vue";
import vuetify from "@/app/plugins/vuetify";
import "@/main.scss";

import store from "./app/providers/store";
import router from "./app/providers/router";
import sync from "./shared/lib/vuex-router-sync";
import { settingsActions } from "@/widgets/settings";
// adds reactive router module to global state
sync(store, router);

//loads app settings from the local storage (if there are any saved)
store.dispatch(settingsActions.LOAD_SETTINGS_FROM_STORAGE).then(() => {
  createApp(App).use(store).use(router).use(vuetify).mount("#app");
});
