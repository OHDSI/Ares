import {
  SOURCES,
  EXPLORER_LOADED,
  LOAD_QUERY_INDEX,
} from "@/widgets/explorer/model/store/mutations.type";

import {
  FETCH_INDEX,
  FETCH_QUERY_INDEX,
} from "@/widgets/explorer/model/store/actions.type";
import { EXPORT_QUERY_INDEX, INDEX } from "@/shared/config/files";
import apiService from "@/shared/api/apiService";
import getFilePath from "@/shared/api/getFilePath";
import config from "@/widgets/explorer/config";
import { errorActions } from "@/widgets/error";

const state = {
  folders: config.folders,
  sources: null,
  reports: config.reports,
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
    return apiService(getFilePath(params)[INDEX], { required: true }).then(
      (response) => {
        if (
          response.payload?.required &&
          response.response?.name === "AxiosError"
        ) {
          dispatch(errorActions.NEW_ERROR, {
            message: response.response.message,
            details: response.response.request.responseURL,
          });
          return;
        }
        commit(SOURCES, response.response.data.sources);
        commit(EXPLORER_LOADED);
      }
    );
  },
  [FETCH_QUERY_INDEX]({ commit, dispatch }, params) {
    apiService(getFilePath(params)[EXPORT_QUERY_INDEX], {
      required: false,
    }).then((response) => {
      if (
        response.payload?.required &&
        response.response?.name === "AxiosError"
      ) {
        dispatch(errorActions.NEW_ERROR, {
          message: response.response.message,
          details: response.response.request.responseURL,
        });
        return;
      }
      commit(LOAD_QUERY_INDEX, response.response.data);
    });
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
