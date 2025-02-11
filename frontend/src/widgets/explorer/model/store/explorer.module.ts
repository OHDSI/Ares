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
import apiService from "@/shared/api/axios/apiService";
import getFilePath from "@/shared/api/axios/files";
import config from "@/widgets/explorer/config";
import { errorActions } from "@/widgets/error";
import { QueryIndexType } from "@/processes/exploreReports/model/interfaces/files/QueryIndex";
import {
  Source,
  SourceRelease,
} from "@/processes/exploreReports/model/interfaces/files/SourceIndex";
import errorMessages from "@/widgets/error/model/config/errorMessages";
import environment from "@/shared/api/environment";

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
  getFilteredReports: function (state, getters, rootState) {
    const webApiEnabled = environment.WEB_API_ENABLED;
    return state.reports.filter((report) => {
      const folderMatch = report.folder === getters.getSelectedFolder.name;
      const webApiCondition = webApiEnabled || !report.webApiRequired;
      return folderMatch && webApiCondition;
    });
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
    const isDomain = rootState.route.params.domain;
    const isRelease = rootState.route.params.release;
    const isCohort = rootState.route.params.cohort_id;
    if (
      isDomain &&
      isRelease &&
      rootState.route.name !== "networkComparisonTool"
    ) {
      const domainTable = getters.getFilteredReports.find(
        (report) => report.domain
      );
      return domainTable.reports.find((report) => {
        return isDomain === report.domain;
      });
    }
    if (isCohort) {
      return getters.getFilteredReports.find((report) => {
        return report.routeName === "cohorts";
      });
    } else {
      return getters.getFilteredReports.find((report) => {
        return rootState.route.matched.some(
          (route) => route.name === report.routeName
        );
      });
    }
  },
};

const actions = {
  [FETCH_INDEX]({ commit, dispatch }, params) {
    return apiService(getFilePath(params)[INDEX], { required: true })
      .then((response) => {
        commit(SOURCES, response.data.sources);
        commit(EXPLORER_LOADED);
      })
      .catch((error) => {
        const errorMessage = errorMessages.reportsMissingFiles.index;
        const url = error.config.url;
        const errorCode = error.response.status;

        dispatch(errorActions.NEW_ERROR, {
          userMessage: errorMessage,
          technicalMessage: { errorCode, url },
          details: url,
        });
      });
  },
  [FETCH_QUERY_INDEX]({ commit, dispatch }, params) {
    return apiService(getFilePath(params)[EXPORT_QUERY_INDEX], {
      required: false,
    }).then((response) => {
      commit(LOAD_QUERY_INDEX, response.data);
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
