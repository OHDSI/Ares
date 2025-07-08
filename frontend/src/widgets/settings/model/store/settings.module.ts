import localStorageService from "@/shared/api/localStorageService";
import {
  LOAD_SETTINGS_FROM_STORAGE,
  TOGGLE_DARK_MODE,
  TOGGLE_THEME_SETTING,
  TOGGLE_MINMAX_SETTING,
  TOGGLE_UI_VISIBILITY,
  TOGGLE_DEFAULT_ANNOTATIONS_MODE,
  TOGGLE_BASELINE_SETTING,
  EDIT_USER,
  TOGGLE_DEFAULT_ALL_NOTES_MODE,
  UPDATE_COLUMN_SELECTION,
  TOGGLE_STICKY_NAV_BAR,
  TOGGLE_STRIPPED_ROWS,
  UPDATE_DEFAULT_SOURCES,
  CHANGE_DRILLDOWN_VIEW_OPTIONS,
} from "@/widgets/settings/model/store/actions.type";
import {
  SET_SETTINGS,
  SET_VISIBILITY,
} from "@/widgets/settings/model/store/mutations.type";

const state = {
  settings: {
    darkMode: false,
    zeroBaseline: true,
    minMax: false,
    theme: "blue",
    annotationsMode: false,
    notesMode: false,
    user: null,
    columnSelection: {},
    stickyNavBar: true,
    strippedRows: false,
    defaultSources: {},
    drillDownViewOptions: {
      class: "h-5/6",
      position: "bottom",
    },
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
  [LOAD_SETTINGS_FROM_STORAGE]({ commit, state }) {
    const savedSettings = localStorageService.get("settings");
    if (savedSettings && typeof savedSettings === "object") {
      const mergedSettings = { ...state.settings, ...savedSettings };
      commit(SET_SETTINGS, { data: mergedSettings });
    }
  },
  [TOGGLE_BASELINE_SETTING]({ commit }, payload) {
    commit(SET_SETTINGS, { data: payload, field: "zeroBaseline" });
  },
  [TOGGLE_DARK_MODE]({ commit }, payload) {
    commit(SET_SETTINGS, { data: payload, field: "darkMode" });
  },
  [TOGGLE_THEME_SETTING]({ commit }, payload) {
    commit(SET_SETTINGS, { data: payload, field: "theme" });
  },
  [TOGGLE_MINMAX_SETTING]({ commit }, payload) {
    commit(SET_SETTINGS, { data: payload, field: "minMax" });
  },
  [TOGGLE_UI_VISIBILITY]({ commit }, payload) {
    commit(SET_VISIBILITY, payload);
  },
  [TOGGLE_DEFAULT_ANNOTATIONS_MODE]({ commit }, payload) {
    commit(SET_SETTINGS, { data: payload, field: "annotationsMode" });
  },
  [TOGGLE_DEFAULT_ALL_NOTES_MODE]({ commit }, payload) {
    commit(SET_SETTINGS, { data: payload, field: "notesMode" });
  },
  [TOGGLE_STICKY_NAV_BAR]({ commit }, payload) {
    commit(SET_SETTINGS, { data: payload, field: "stickyNavBar" });
  },
  [CHANGE_DRILLDOWN_VIEW_OPTIONS]({ commit }, payload) {
    commit(SET_SETTINGS, { data: payload, field: "drillDownViewOptions" });
  },
  [TOGGLE_STRIPPED_ROWS]({ commit }, payload) {
    commit(SET_SETTINGS, { data: payload, field: "strippedRows" });
  },
  [UPDATE_COLUMN_SELECTION]({ commit, rootGetters }, payload) {
    commit(SET_SETTINGS, {
      data: { ...rootGetters.getSettings.columnSelection, ...payload },
      field: "columnSelection",
    });
  },
  [UPDATE_DEFAULT_SOURCES]({ commit }, payload) {
    commit(SET_SETTINGS, { data: payload, field: "defaultSources" });
  },
  [EDIT_USER]({ commit }, payload) {
    commit(SET_SETTINGS, { data: payload, field: "user" });
  },
};

const mutations = {
  [SET_SETTINGS](state, payload) {
    if (payload.field) {
      state.settings = { ...state.settings, [payload.field]: payload.data };
    } else {
      state.settings = payload.data;
    }
    localStorageService.set("settings", state.settings);
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
