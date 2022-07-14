import {
  SOURCES,
  EXPLORER_LOADED,
  LOAD_QUERY_INDEX,
} from "@/data/store/modules/explorer/mutations.type";

import {
  FETCH_INDEX,
  FETCH_QUERY_INDEX,
} from "@/data/store/modules/explorer/actions.type";
import { EXPORT_QUERY_INDEX, INDEX } from "@/data/services/getFilePath";
import { explorerConfigs } from "@/configs";
import loadFile from "@/data/services/loadFile";
import getFilePath from "@/data/services/getFilePath";

const state = {
  folders: explorerConfigs.folders,
  sources: null,
  reports: explorerConfigs.reports,
  queryIndex: null,
  dataLoaded: false,
};

const getters = {
  getQueryIndex: function (state) {
    return state.queryIndex;
  },
  getSources: function (state) {
    return state.sources;
  },
  explorerLoaded: function (state) {
    return state.dataLoaded;
  },
  getSelectedFolder: function (state, getters, rootState) {
    return state.folders.find((folder) =>
      rootState.route.matched.some((route) => route.name === folder.key)
    );
  },
  getFilteredReports: function (state, getters) {
    return state.reports.filter(
      (report) => report.folder === getters.getSelectedFolder.name
    );
  },
  getSelectedSource: function (state, getters, rootState) {
    return getters.getSources.find(
      (source) => rootState.route.params.cdm === source.cdm_source_key
    );
  },
  getReleases: function (state, getters) {
    return getters.getSelectedSource.releases;
  },
  getSelectedRelease: function (state, getters, rootState) {
    return rootState.route.params.release
      ? getters.getReleases.find(
          (release) => rootState.route.params.release === release.release_id
        )
      : getters.getReleases[0];
  },
  getSelectedReport: function (state, getters, rootState) {
    return getters.getFilteredReports.find((report) =>
      report.domain
        ? rootState.route.params.domain === report.domain
        : rootState.route.matched.some(
            (route) => route.name === report.routeName
          )
    );
  },
};

const actions = {
  [FETCH_INDEX]({ commit, dispatch }, params) {
    loadFile(getFilePath(params)[INDEX], { required: true }).then(
      (response) => {
        commit(SOURCES, response.response.data.sources);
        commit(EXPLORER_LOADED);
      }
    );
  },
  [FETCH_QUERY_INDEX]({ commit, dispatch }, params) {
    loadFile(getFilePath(params)[EXPORT_QUERY_INDEX], { required: false }).then(
      (response) => {
        commit(LOAD_QUERY_INDEX, response.response.data);
      }
    );
  },
};

const mutations = {
  [SOURCES](state, payload) {
    state.sources = payload;
  },
  [EXPLORER_LOADED](state) {
    state.dataLoaded = true;
  },
  [LOAD_QUERY_INDEX](state, payload) {
    state.queryIndex = payload;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
