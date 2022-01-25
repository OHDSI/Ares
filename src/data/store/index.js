import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import explorer from "./modules/explorer/explorer.module";
import view from "./modules/view/view.module";
import errors from "@/data/store/modules/errors/errors.module";

export default new Vuex.Store({
  modules: {
    explorer,
    view,
    errors,
  },
});
