import localStorageService from "@/data/services/localStorageService";
import { LOAD_FROM_STORAGE } from "@/data/store/modules/settings/actions.type";
import {
  SET_BASELINE,
  SET_DARK_MODE,
  SET_MINMAX,
  SET_SETTINGS,
  SET_VISIBILITY,
} from "@/data/store/modules/settings/mutations.type";

const state = {
  settings: {
    darkMode: false,
    zeroBaseline: true,
    minMax: false,
  },
  visible: false,
};

const getters = {
  getSettings: function (state) {
    return state.settings;
  },
  getVisibility: function (state) {
    return state.visible;
  },
};

const actions = {
  [LOAD_FROM_STORAGE]({ commit }) {
    if (localStorageService.get("settings")) {
      commit(SET_SETTINGS, localStorageService.get("settings"));
    }
  },
};

const mutations = {
  [SET_DARK_MODE](state, payload) {
    state.settings.darkMode = payload;
    localStorageService.set("settings", state.settings);
  },
  [SET_BASELINE](state, payload) {
    state.settings.zeroBaseline = payload;
    localStorageService.set("settings", state.settings);
  },
  [SET_MINMAX](state, payload) {
    state.settings.minMax = payload;
    localStorageService.set("settings", state.settings);
  },
  [SET_SETTINGS](state, payload) {
    state.settings = payload;
  },
  [SET_VISIBILITY](state, payload) {
    state.visible = payload;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
