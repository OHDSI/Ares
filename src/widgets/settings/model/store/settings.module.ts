import localStorageService from "@/shared/api/localStorageService";
import {
  LOAD_SETTINGS_FROM_STORAGE,
  CHANGE_BASELINE_SETTING,
  CHANGE_MINMAX_SETTING,
  CHANGE_THEME_SETTING,
  CHANGE_UI_VISIBILITY,
} from "@/widgets/settings/model/store/actions.type";
import {
  SET_BASELINE,
  SET_DARK_MODE,
  SET_MINMAX,
  SET_SETTINGS,
  SET_VISIBILITY,
} from "@/widgets/settings/model/store/mutations.type";

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
  getVisibility: function (state): boolean {
    return state.visible;
  },
};

const actions = {
  [LOAD_SETTINGS_FROM_STORAGE]({ commit }) {
    if (localStorageService.get("settings")) {
      commit(SET_SETTINGS, localStorageService.get("settings"));
    }
  },
  [CHANGE_BASELINE_SETTING]({ commit }, payload) {
    commit(SET_BASELINE, payload);
  },
  [CHANGE_THEME_SETTING]({ commit }, payload) {
    commit(SET_DARK_MODE, payload);
  },
  [CHANGE_MINMAX_SETTING]({ commit }, payload) {
    commit(SET_MINMAX, payload);
  },
  [CHANGE_UI_VISIBILITY]({ commit }, payload) {
    commit(SET_VISIBILITY, payload);
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
