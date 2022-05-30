import getFilePath from "@/data/services/getFilePath";
import loadFile from "@/data/services/loadFile";
import processors from "@/data/store/modules/view/preprocessing";
import { CLEAR_DATA, SET_DATA } from "./mutations.type";
import {
  FETCH_FILES,
  FETCH_MULTIPLE_FILES_BY_RELEASE,
  FETCH_MULTIPLE_FILES_BY_SOURCE,
} from "@/data/store/modules/view/actions.type";
import { NEW_ERROR } from "@/data/store/modules/errors/actions.type";
import postprocessing from "@/data/store/modules/view/postprocessing";
import preProcessing from "@/data/store/modules/view/preprocessing";

const state = {
  data: {},
};

const getters = {
  getData: (state) => {
    return state.data;
  },
  dataInStore: (state) => {
    return Object.keys(state.data).length;
  },
};

const actions = {
  [CLEAR_DATA]({ commit }) {
    commit(CLEAR_DATA);
  },
  async [FETCH_FILES]({ commit, dispatch, rootState }, payload) {
    const promises = payload.files.map((file) => {
      return loadFile(
        getFilePath(payload.params ? payload.params : rootState.route.params)[
          file.name
        ],
        {
          // if required === true && no file loaded then add an error
          required: file.required,
        }
      );
    });

    await Promise.allSettled(promises).then((responses) => {
      const data = responses.reduce(
        (obj, currValue, index) => ({
          ...obj,
          [payload.files[index].name]: processors[payload.files[index].name]
            ? processors[payload.files[index].name](
                currValue.value?.response?.data
              )
            : currValue.value?.response?.data,
        }),
        {}
      );

      postprocessing[rootState.route.name]
        ? commit(SET_DATA, postprocessing[rootState.route.name](data))
        : commit(SET_DATA, data);
    });
  },

  async [FETCH_MULTIPLE_FILES_BY_SOURCE](
    { commit, dispatch, rootState, rootGetters },
    payload
  ) {
    const promises = payload.files.reduce(
      (obj, file) => ({
        ...obj,
        [file]: rootGetters.getSources.map((source) => {
          return loadFile(
            getFilePath({
              cdm: source.cdm_source_key,
              release: source.releases[0].release_id,
              domain: payload.params?.domain
                ? payload.params.domain
                : rootState.route.params.domain,
              concept: payload.params?.concept
                ? payload.params.concept
                : rootState.route.params.concept,
            })[file],
            { source }
          );
        }),
      }),
      {}
    );

    const data = {};
    for (const file in promises) {
      await Promise.allSettled(promises[file]).then((responses) => {
        data[file] = responses
          .filter((response) => response.value?.response?.data)
          .map((filtered) => ({
            data: processors[file]
              ? processors[file](filtered.value.response.data)
              : filtered.value.response.data,
            source: filtered.value.payload.source,
          }));
        if (data[file].length === 0 && payload.criticalError) {
          dispatch(NEW_ERROR, {
            message: "No files found across data sources",
            details: "No additional data",
          });
        }
      });
    }
    postprocessing[rootState.route.name]
      ? commit(SET_DATA, postprocessing[rootState.route.name](data))
      : commit(SET_DATA, data);
  },

  async [FETCH_MULTIPLE_FILES_BY_RELEASE](
    { commit, dispatch, rootState, rootGetters },
    payload
  ) {
    const promises = payload.files.reduce(
      (obj, file) => ({
        ...obj,
        [file]: rootGetters.getSelectedSource.releases.map((release) => {
          return loadFile(
            getFilePath({
              cdm: rootGetters.getSelectedSource.cdm_source_key,
              release: release.release_id,
              domain: rootState.route.params.domain,
              concept: rootState.route.params.concept,
            })[file],
            release.release_name
          );
        }),
      }),
      {}
    );
    const data = {};
    for (const file in promises) {
      await Promise.allSettled(promises[file]).then((responses) => {
        data[file] = responses
          .filter((response) => response.value?.response?.data)
          .map((filtered) => ({
            data: filtered.value.response.data,
            release: filtered.value.payload,
          }));
        if (data[file].length === 0) {
          dispatch(NEW_ERROR, {
            message: "No files found across current data source releases",
            details: rootGetters.getSelectedSource.cdm_source_abbreviation,
          });
        }
      });
    }
    postprocessing[rootState.route.name]
      ? commit(SET_DATA, postprocessing[rootState.route.name](data))
      : commit(SET_DATA, data);
  },
};

const mutations = {
  [SET_DATA](state, payload) {
    state.data = payload;
  },
  [CLEAR_DATA](state) {
    state.data = {};
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
