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
import db from "@/shared/api/duckdb/instance";
import getDuckDBFilePath from "@/shared/api/duckdb/files";
import environment from "@/shared/api/environment";
import getFilesByView from "@/processes/exploreReports/config/dataLoadConfig";
import errorMessages from "@/widgets/error/model/config/errorMessages";

const state = {
  data: {},
};

const getters = {
  getData: (state) => {
    return state.data.data;
  },
  dataInStore: (state, getters, rootState) => {
    if (rootState.route.name === "webApi") {
      return Object.keys(rootState.webApiStore.apiData).length;
    }
    if (getFilesByView({ files: [] })[rootState.route.name]) {
      return Object.keys(state.data).length;
    } else {
      return rootState.explorerStore.dataLoaded;
    }
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

function compareDefaultAvailableSources(availableSources, defaultSources) {
  return availableSources
    .map((source) => {
      const sourceKey = source.cdm_source_key;
      if (defaultSources[sourceKey]) {
        const filteredReleases = source.releases.filter((release) =>
          defaultSources[sourceKey].includes(release.release_id)
        );
        if (filteredReleases.length > 0) {
          return {
            ...source,
            releases: filteredReleases,
          };
        }
      }
      return null;
    })
    .filter(Boolean);
}

async function fetchDuckDBData(file, payload, path, filter) {
  const c = await db.connect();
  return c
    .query(
      `SELECT * FROM read_parquet('${
        getDuckDBFilePath({
          cdm: path.cdm.cdm_source_key,
          release: path.release,
        })[file.name]
      }') ${filter};`
    )
    .then((data) => ({
      data: data,
      file: file,
      duckdb_supported: payload.duckdb_supported,
      payload: path,
    }));
}

function commitData(data, { dispatch, commit }, reportName) {
  try {
    if (data && Object.keys(data).length) {
      postprocessing[reportName]
        ? commit(SET_DATA, {
            data: postprocessing[reportName](data),
          })
        : commit(SET_DATA, { data });
    } else {
      commit(SET_DATA, {});
    }
  } catch (e) {
    dispatch(errorActions.NEW_ERROR, {
      userMessage: errorMessages.technicalError.codeError,
      name: e.name,
      details: e.message,
      stack: e.stack,
      type: "unexpected",
      page: reportName,
    });
  }
}

function processData(data, isDuckDb, fileName) {
  if (isDuckDb) {
    return convertTableToArray(data);
  }
  if (!isDuckDb && preprocessing[fileName]) {
    return preprocessing[fileName](data);
  } else {
    return data;
  }
}

function handleNetworkError(responses, { dispatch }, reportName, isDuckDb) {
  const errorCode = responses[0].reason?.response?.status;
  let errorMessage;
  const errorDetails = responses.map((val) => ({
    url: val.reason?.config?.url,
    errorCode,
  }));
  if (isDuckDb) {
    errorMessage =
      "The file is unavailable or the server isn't responding. Please check your internet connection and your data folder then try again";
  }
  if (errorCode === 404 && !isDuckDb) {
    errorMessage = errorMessages.reportsMissingFiles[reportName];
  }
  if (
    ((errorCode && errorCode >= 500) || typeof errorCode !== "number") &&
    !isDuckDb
  ) {
    errorMessage = errorMessages.technicalError.networkError;
  }

  if (errorMessage) {
    const message = responses[0].reason.stack;
    dispatch(errorActions.NEW_ERROR, {
      userMessage: errorMessage,
      technicalMessage: { errorCode, errorDetails, message },
      details: errorDetails,
    });
  }
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
  [RESET_DATA_STORAGE]({ commit }, payload) {
    if (payload?.skipLoading) {
      commit(CLEAR_DATA, payload?.skipLoading);
    } else {
      commit(CLEAR_DATA);
    }
  },

  async [FETCH_FILES]({ commit, dispatch, rootState }, payload) {
    const isDuckDb = payload.duckdb_supported && environment.DUCKDB_ENABLED;
    const reportName = rootState.route.name;
    const path = {
      cdm: {
        cdm_source_key: payload.params?.cdm
          ? payload.params?.cdm
          : rootState.route.params.cdm,
      },
      release: payload.params?.release
        ? payload.params?.release
        : rootState.route.params.release,
      domain: payload.params?.domain
        ? payload.params?.domain
        : rootState.route.params.domain,
      concept: payload.params?.concept
        ? payload.params?.concept
        : rootState.route.params.concept,
      cohortId: payload.params?.cohort_id
        ? payload.params?.cohort_id
        : rootState.route.params.cohort_id,
    };
    if (!payload.files) {
      commit(SET_DATA, { data: {} });
      return;
    }
    const promises = payload.files.map((file) => {
      if (isDuckDb && file.source !== "axios") {
        let filterConcept;
        if (rootState.route.name === "costDrilldown") {
          filterConcept = `WHERE CONCEPT_ID == ${path.concept}`;
        } else {
          filterConcept = `WHERE DOMAIN == '${path.domain.toLowerCase()}' AND CONCEPT_ID == ${
            path.concept
          }`;
        }

        const filterCohort = `WHERE COHORT_ID == ${path.cohortId}`;
        return fetchDuckDBData(
          file,
          payload,
          path,
          path.concept ? filterConcept : path.cohortId ? filterCohort : ""
        );
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
        const isRequired = payload.files[index].required;

        if (status === "fulfilled") {
          //data processing
          data[fileName] = processData(
            fileData,
            isDuckDb && payload.files[index].source !== "axios",
            fileName
          );
        } else {
          if (isRequired) {
            handleNetworkError(
              [response],
              { dispatch },
              reportName,
              isDuckDb && payload.files[index].source !== "axios"
            );
            data = null;
            return;
          }
          data[fileName] = [];
        }
      });

      if (data) {
        commitData(data, { dispatch, commit }, reportName);
      }
    });
  },

  async [FETCH_MULTIPLE_FILES_BY_SOURCE](
    { commit, dispatch, rootState, rootGetters },
    payload
  ) {
    if (!payload.files) {
      commit(SET_DATA, { data: {} });
      return;
    } else {
      const isDuckDb = environment.DUCKDB_ENABLED && payload.duckdb_supported;

      const reportName = rootState.route.name;
      const availableSources = rootGetters.getSources;
      const defaultSources = rootGetters.getSettings.defaultSources;
      const defaultSourcesToLoad = compareDefaultAvailableSources(
        availableSources,
        defaultSources
      );
      const toLoad = defaultSourcesToLoad.length
        ? defaultSourcesToLoad
        : availableSources;
      const promises = payload.files.reduce((obj, file) => {
        obj[file.name] = toLoad.reduce((filesArray, currentSource) => {
          const loadedFiles = file.instanceParams.reduce(
            (array, currentInstance) => {
              const path = {
                cdm: currentSource,
                release: currentSource.releases[0].release_id,
                domain: currentInstance.domain || rootState.route.params.domain,
                concept:
                  currentInstance.concept || rootState.route.params.concept,
              };
              const filter = `WHERE DOMAIN == '${path.domain}' AND CONCEPT_ID == ${path.concept}`;

              const fetchData =
                isDuckDb && file.source !== "axios"
                  ? fetchDuckDBData(file, payload, path, filter)
                  : fetchAxiosData(file, path);
              return [...array, fetchData];
            },
            []
          );

          return [...filesArray, ...loadedFiles];
        }, []);

        return obj;
      }, {});

      const data = {};
      for (const file in promises) {
        const responses = await Promise.allSettled(promises[file]);
        data[file] = responses
          .filter((response) => response.status === "fulfilled")
          .map((filtered) => ({
            data: isDuckDb
              ? convertTableToArray(filtered.value.data)
              : preprocessing[file]
              ? preprocessing[file](filtered.value.data)
              : filtered.value?.data,
            source: filtered.value?.payload.cdm,
          }));

        //handle network error
        if (data[file].length === 0 && payload.criticalError) {
          handleNetworkError(responses, { dispatch }, reportName, isDuckDb);
        }
      }
      if (data) {
        commitData(data, { dispatch, commit }, reportName);
      }
    }
  },

  async [FETCH_MULTIPLE_FILES_BY_RELEASE](
    { commit, dispatch, rootState, rootGetters },
    payload
  ) {
    if (!payload.files) {
      commit(SET_DATA, { data: {} });
      return;
    }
    const isDuckDb = payload.duckdb_supported && environment.DUCKDB_ENABLED;
    const reportName = rootState.route.name;
    const promises = payload.files.reduce((obj, file) => {
      const selectedSource = rootGetters.getSelectedSource;
      const params = {
        cdm: selectedSource.cdm_source_key,
        domain: rootState.route.params.domain,
        concept: rootState.route.params.concept,
      };

      obj[file.name] = selectedSource.releases.map((release) => {
        if (isDuckDb && file.source !== "axios") {
          const filter = `WHERE DOMAIN == '${params.domain}' AND CONCEPT_ID == ${params.concept}`;

          return fetchDuckDBData(
            file,
            payload,
            {
              ...params,
              release: release.release_id,
            },
            filter
          );
        } else {
          const url = getFilePath({
            ...params,
            release: release.release_id,
          })[file.name];

          return apiService(
            {
              url,
              method: "get",
            },
            release.release_name
          );
        }
      });

      return obj;
    }, {});

    let data = {};
    for (const file in promises) {
      const responses = await Promise.allSettled(promises[file]);
      data[file] = responses
        .filter((response) => response.status === "fulfilled")
        .map((filtered) => {
          const { data, payload } = filtered.value;
          return {
            data: processData(data, isDuckDb, file),
            release: payload,
          };
        });
      if (data[file].length === 0) {
        handleNetworkError(responses[0], { dispatch }, reportName, isDuckDb);
        data = null;
      }
    }
    if (data) {
      commitData(data, { dispatch, commit }, reportName);
    }
  },
};

const mutations = {
  [SET_DATA](state, payload) {
    state.data = { ...state.data, ...payload };
  },
  [CLEAR_DATA](state, payload) {
    if (payload) {
      state.data = { showLoading: false };
      state.webApiData = {};
    } else {
      state.data = {};
      state.webApiData = {};
    }
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
