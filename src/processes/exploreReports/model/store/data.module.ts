import getFilePath from "@/shared/api/axios/files";
import apiService from "@/shared/api/axios/apiService";

import preprocessing from "./preprocessing";
import postprocessing from "./postprocessing";

import { CLEAR_DATA, SET_DATA } from "./mutations.type";
import {
  FETCH_FILES,
  FETCH_MULTIPLE_FILES_BY_RELEASE,
  FETCH_MULTIPLE_FILES_BY_SOURCE,
  RESET_DATA_STORAGE,
} from "./actions.type";

import { errorActions } from "@/widgets/error";
import { SourceRelease } from "@/processes/exploreReports/model/interfaces/files/SourceIndex";
import db from "@/shared/api/duckdb/instance";
import getDuckDBFilePath from "@/shared/api/duckdb/files";
import environment from "@/shared/api/environment";

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

async function fetchAxiosData(file, path) {
  return apiService(
    {
      url: getFilePath(
        file.params
          ? file.params
          : {
              cdm: path.cdm.cdm_source_key,
              release: path.release,
              domain: path.domain,
              concept: path.concept,
            }
      )[file.name],
      method: "get",
    },
    {
      required: file.required,
    }
  ).then((response) => ({
    data: response.data,
    payload: path,
  }));
}
async function fetchDuckDBData(file, payload, path) {
  const c = await db.connect();
  return c
    .query(
      `SELECT * FROM read_parquet('${
        getDuckDBFilePath({
          cdm: path.cdm.cdm_source_key,
          release: path.release,
        })[file.name]
      }') WHERE DOMAIN == '${path.domain}' AND CONCEPT_ID == ${path.concept};`
    )
    .then((data) => ({
      data: data,
      file: file,
      duckdb_supported: payload.duckdb_supported,
      payload: path,
    }));
}

function convertTableToArray(table) {
  const dataTable = [];
  for (const row of table) {
    let rowData = {};
    for (const colName in row) {
      if (row.hasOwnProperty(colName)) {
        rowData = { ...rowData, [colName]: row[colName] };
      }
    }
    dataTable.push(rowData);
  }

  return dataTable;
}

const actions = {
  [RESET_DATA_STORAGE]({ commit }) {
    commit(CLEAR_DATA);
  },

  async [FETCH_FILES]({ commit, dispatch, rootState }, payload) {
    const path = {
      cdm: { cdm_source_key: rootState.route.params.cdm },
      release: rootState.route.params.release,
      domain: rootState.route.params.domain,
      concept: rootState.route.params.concept,
    };
    const promises = payload.files.map((file) => {
      if (
        payload.duckdb_supported &&
        environment.DUCKDB_ENABLED === "true" &&
        file.source !== "axios"
      ) {
        return fetchDuckDBData(file, payload, path);
      } else {
        return fetchAxiosData(file, path);
      }
    });

    let data = {};

    await Promise.allSettled(promises).then((responses) => {
      responses.forEach((response, index) => {
        const status = response.status;
        const fileData = response.value?.data;
        const fileName = payload.files[index].name;

        if (status === "fulfilled") {
          data[fileName] =
            response.value.duckdb_supported &&
            environment.DUCKDB_ENABLED === "true" &&
            payload.files[index].source !== "axios"
              ? convertTableToArray(fileData)
              : preprocessing[fileName]
              ? preprocessing[fileName](fileData)
              : fileData;
        } else if (status === "rejected" && payload.files[index].required) {
          const message = response.reason.message;
          const url = response.reason?.config?.url;
          dispatch(errorActions.NEW_ERROR, { message, details: url });
          data = null;
          return;
        } else {
          data[fileName] = [];
        }
      });
      try {
        if (data) {
          postprocessing[rootState.route.name]
            ? commit(SET_DATA, postprocessing[rootState.route.name](data))
            : commit(SET_DATA, data);
        }
      } catch (e) {
        dispatch(errorActions.NEW_ERROR, {
          message: `An unexpected error has occurred (${e.name})`,
          name: e.name,
          details: e.message,
          stack: e.stack,
          type: "unexpected",
          page: rootState.route.name,
        });
      }
    });
  },

  async [FETCH_MULTIPLE_FILES_BY_SOURCE](
    { commit, dispatch, rootState, rootGetters },
    payload
  ) {
    const promises = payload.files.reduce(
      (obj, file) => ({
        ...obj,
        [file.name]: rootGetters.getSources.reduce(
          (filesArray, currentSource) => {
            const loadedFiles = file.instanceParams.reduce(
              (array, currentInstance) => {
                return [
                  ...array,
                  payload.duckdb_supported &&
                  environment.DUCKDB_ENABLED === "true" &&
                  file.source !== "axios"
                    ? fetchDuckDBData(file, payload, {
                        cdm: currentSource,
                        release: currentSource.releases[0].release_id,
                        domain: currentInstance.domain
                          ? currentInstance.domain
                          : rootState.route.params.domain,
                        concept: currentInstance.concept
                          ? currentInstance.concept
                          : rootState.route.params.concept,
                      })
                    : fetchAxiosData(file, {
                        cdm: currentSource,
                        release: currentSource.releases[0].release_id,
                        domain: currentInstance.domain
                          ? currentInstance.domain
                          : rootState.route.params.domain,
                        concept: currentInstance.concept
                          ? currentInstance.concept
                          : rootState.route.params.concept,
                      }),
                ];
              },
              []
            );
            return [...filesArray, ...loadedFiles];
          },
          []
        ),
      }),
      {}
    );

    let data = {};
    for (const file in promises) {
      await Promise.allSettled(promises[file]).then((responses) => {
        data[file] = responses
          .filter((response) => response.status === "fulfilled")
          .map(
            (
              filtered: PromiseFulfilledResult<{
                data: never[];
                payload: { cdm: string };
              }>
            ) => ({
              data:
                payload.duckdb_supported &&
                environment.DUCKDB_ENABLED === "true"
                  ? convertTableToArray(filtered.value.data)
                  : preprocessing[file]
                  ? preprocessing[file](filtered.value.data)
                  : filtered.value?.data,
              source: filtered.value?.payload.cdm,
            })
          );
        if (data[file].length === 0 && payload.criticalError) {
          data = null;
          dispatch(errorActions.NEW_ERROR, {
            message: "No files found across data sources",
            details: "No additional data",
          });
        }
      });
    }
    try {
      if (data) {
        postprocessing[rootState.route.name]
          ? commit(SET_DATA, postprocessing[rootState.route.name](data))
          : commit(SET_DATA, data);
      }
    } catch (e) {
      dispatch(errorActions.NEW_ERROR, {
        message: `An unexpected error has occurred (${e.name})`,
        details: e.message,
        stack: e.stack,
        type: "unexpected",
      });
    }
  },

  async [FETCH_MULTIPLE_FILES_BY_RELEASE](
    { commit, dispatch, rootState, rootGetters },
    payload
  ) {
    const promises = payload.files.reduce(
      (obj, file) => ({
        ...obj,
        [file.name]: rootGetters.getSelectedSource.releases.map((release) => {
          if (
            payload.duckdb_supported &&
            environment.DUCKDB_ENABLED === "true" &&
            file.source !== "axios"
          ) {
            return fetchDuckDBData(file, payload, {
              cdm: rootGetters.getSelectedSource,
              release: release.release_id,
              domain: rootState.route.params.domain,
              concept: rootState.route.params.concept,
            });
          } else {
            return apiService(
              {
                url: getFilePath({
                  cdm: rootGetters.getSelectedSource.cdm_source_key,
                  release: release.release_id,
                  domain: rootState.route.params.domain,
                  concept: rootState.route.params.concept,
                })[file.name],
                method: "get",
              },
              release.release_name
            );
          }
        }),
      }),
      {}
    );
    let data = {};
    for (const file in promises) {
      await Promise.allSettled(promises[file]).then((responses) => {
        data[file] = responses
          .filter((response) => response.status === "fulfilled")
          .map(
            (
              filtered: PromiseFulfilledResult<{
                data: never;
                payload: SourceRelease;
              }>
            ) => ({
              data:
                payload.duckdb_supported &&
                environment.DUCKDB_ENABLED === "true"
                  ? convertTableToArray(filtered.value?.data)
                  : filtered.value.data,
              release: filtered.value?.payload,
            })
          );
        if (data[file].length === 0) {
          data = null;
          dispatch(errorActions.NEW_ERROR, {
            message: "No files found across current data source releases",
            details: rootGetters.getSelectedSource.cdm_source_abbreviation,
          });
        }
      });
    }
    try {
      if (data) {
        postprocessing[rootState.route.name]
          ? commit(SET_DATA, postprocessing[rootState.route.name](data))
          : commit(SET_DATA, data);
      }
    } catch (e) {
      dispatch(errorActions.NEW_ERROR, {
        message: `An unexpected error has occurred (${e.name})`,
        details: e.message,
        stack: e.stack,
        type: "unexpected",
        page: rootState.route.name,
      });
    }
  },
};

const mutations = {
  [SET_DATA](state, payload) {
    state.data = { ...state.data, ...payload };
  },
  [CLEAR_DATA](state) {
    state.data = {};
    state.webApiData = {};
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
