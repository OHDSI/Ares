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
import loadFile from "@/shared/api/loadFile";
import getFilePath from "@/shared/api/getFilePath";
import config from "@/widgets/explorer/config";
import { errorActions } from "@/widgets/error";
import { QueryIndexType } from "@/processes/exploreReports/model/interfaces/files/QueryIndex";
import {
  Source,
  SourceRelease,
} from "@/processes/exploreReports/model/interfaces/files/SourceIndex";

const state = {
  folders: config.folders,
  sources: null,
  reports: config.reports,
  queryIndex: null,
  dataLoaded: false,
};

const getters = {
  getQueryIndex: function (state): QueryIndexType {
    return state.queryIndex;
  },
  getSources: function (state): Source[] {
    return state.sources;
  },
  explorerLoaded: function (state): boolean {
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
  getSelectedSource: function (state, getters, rootState): Source {
    return getters.getSources.find(
      (source) => rootState.route.params.cdm === source.cdm_source_key
    );
  },
  getReleases: function (state, getters): SourceRelease[] {
    return getters.getSelectedSource.releases;
  },
  getSelectedRelease: function (state, getters, rootState): SourceRelease {
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
    return loadFile(getFilePath(params)[INDEX], { required: true })
      .then((response) => {
        commit(SOURCES, response.data.sources);
        commit(EXPLORER_LOADED);
      })
      .catch((error) => {
        dispatch(errorActions.NEW_ERROR, {
          message: error.error.message,
          details: error.error.response.request.responseURL,
        });
      });
  },
  [FETCH_QUERY_INDEX]({ commit, dispatch }, params) {
    return loadFile(getFilePath(params)[EXPORT_QUERY_INDEX], {
      required: false,
    })
      .then((response) => {
        commit(LOAD_QUERY_INDEX, response.data);
      })
      .catch((error) => {
        dispatch(errorActions.NEW_ERROR, {
          message: error.error.message,
          details: error.error.response.request.responseURL,
        });
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
