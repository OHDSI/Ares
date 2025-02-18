import localStorageService from "@/shared/api/localStorageService";
import {
  CREATE_SELECTION,
  DELETE_SELECTION,
  EDIT_SELECTION,
  EXPORT_NOTES,
  LOAD_API_NOTES,
  LOAD_NOTES,
  SHOW_DATUM_NOTES,
  SHOW_DIALOG,
} from "@/widgets/notesPanel/model/store/actions.type";
import _ from "lodash";
import {
  createNestedProperty,
  mergeAndCompareByDate,
  mergeObjects,
} from "@/widgets/notesPanel/model/lib/helpers";

import {
  SET_NOTES,
  SET_SELECTED_RECTANGLE,
  SET_DIALOG,
} from "@/widgets/notesPanel/model/store/mutations.type";
import apiService from "@/shared/api/axios/apiService";
import getFilePath from "@/shared/api/axios/files";
import { NOTES } from "@/shared/config/files";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { AnnotationsService } from "@/shared/api/aresApi/services/annotationsService";
import environment from "@/shared/api/environment";

const state = {
  notes: {},
  dialog: { show: false, data: {}, action: null, coordinates: null },
  selectedRectangle: null,
};

const getters = {
  getNotes: function (state) {
    return state.notes;
  },
  getDialogData: function (state) {
    return state.dialog;
  },
  getSelectedRectangle: function (state) {
    return state.selectedRectangle;
  },
};

const actions = {
  async [LOAD_API_NOTES]({ commit, rootGetters }, payload) {
    if (!payload || !payload.length) return;
    const data = await AnnotationsService.search.get(payload);
    // const sources = [...rootGetters.getSources, { cdm_source_key: undefined }];
    // await Promise.allSettled(
    //   sources.map((source) =>
    //     apiService(
    //       {
    //         url: getFilePath({
    //           cdm: source.cdm_source_key,
    //         })[NOTES],
    //         method: "get",
    //       },
    //       { source }
    //     )
    //   )
    // ).then((responses) => {
    //   const loadedData = responses.reduce((object, response) => {
    //     if (response.status === "fulfilled") {
    //       return mergeObjects(object, response.value.data, "id");
    //     }
    //     return object;
    //   }, {});
    //   const notes = localStorageService.get("notes")
    //     ? mergeAndCompareByDate(localStorageService.get("notes"), loadedData)
    //     : loadedData;
    //
    commit(SET_NOTES, { data: data.data });
    //   // localStorageService.set("notes", notes);
    // });
  },
  async [LOAD_NOTES]({ commit, rootGetters }) {
    const sources = [...rootGetters.getSources, { cdm_source_key: undefined }];
    await Promise.allSettled(
      sources.map((source) =>
        apiService(
          {
            url: getFilePath({
              cdm: source.cdm_source_key,
            })[NOTES],
            method: "get",
          },
          { source }
        )
      )
    ).then((responses) => {
      const loadedData = responses.reduce((object, response) => {
        if (response.status === "fulfilled") {
          return mergeObjects(object, response.value.data, "id");
        }
        return object;
      }, {});
      const notes = localStorageService.get("notes")
        ? mergeAndCompareByDate(localStorageService.get("notes"), loadedData)
        : loadedData;

      commit(SET_NOTES, { data: notes });
      localStorageService.set("notes", notes);
    });
  },

  [EXPORT_NOTES]({ getters }) {
    const allNotes = getters.getNotes;
    const zip = new JSZip();
    const sources = {};
    const network = {};
    for (const report in allNotes) {
      allNotes[report].forEach((annotation) => {
        const annotationSource = annotation.metadata.scope.value.source;
        if (annotationSource) {
          annotationSource.forEach((source) => {
            sources[source] = sources[source]
              ? {
                  ...sources[source],
                  [report]: sources[source][report]
                    ? [...sources[source][report], annotation]
                    : [annotation],
                }
              : { [report]: [annotation] };
          });
        } else {
          network[report] = network[report]
            ? [...network[report], annotation]
            : [annotation];
        }
      });
    }
    for (const source in sources) {
      const sourceContainer = new Blob([JSON.stringify(sources[source])], {
        type: "application/json",
      });
      zip.folder(source).file("notes.json", sourceContainer);
    }
    const networkContainer = new Blob([JSON.stringify(network)], {
      type: "application/json",
    });
    zip.folder("network").file("notes.json", networkContainer);

    zip
      .generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      })
      .then(function (content) {
        // see FileSaver.js
        saveAs(content, "notes.zip");
      });
  },

  async [CREATE_SELECTION](
    { commit, getters, rootState, rootGetters },
    params
  ) {
    const chartName = params.reportName;

    const webApiEnabled = environment.WEB_API_ENABLED;
    const loggedIn = rootGetters.getWebAPIUser;
    const useAnnotationsApi = environment.USE_ANNOTATIONS_API;

    const useBackend = webApiEnabled
      ? loggedIn && useAnnotationsApi
      : useAnnotationsApi;

    let data = { ...getters.getNotes };
    const path = [chartName].filter(Boolean);
    data = createNestedProperty(data, path);
    if (useBackend) {
      const annotation = await AnnotationsService.create.post(
        "123",
        chartName,
        params.selection.coordinates,
        params.selection.metadata,
        params.selection.body
      );
      _.get(data, path.join(".")).push(annotation.data.annotation);
    } else {
      _.get(data, path.join(".")).push(params.selection);
    }
    commit(SET_NOTES, { data });
    commit(SET_SELECTED_RECTANGLE, null);
    if (!useBackend) {
      localStorageService.set("notes", getters.getNotes);
    }
  },

  async [EDIT_SELECTION](
    { commit, state, getters, rootState, rootGetters },
    params
  ) {
    const webApiEnabled = environment.WEB_API_ENABLED;
    const loggedIn = rootGetters.getWebAPIUser;
    const useAnnotationsApi = environment.USE_ANNOTATIONS_API;

    const useBackend = webApiEnabled
      ? loggedIn && useAnnotationsApi
      : useAnnotationsApi;

    const chartName = getters.getSelectedRectangle?.report || params.report;
    const selectionId =
      getters.getSelectedRectangle?.item?.id || params.data.id;

    const { coordinates, metadata, body } = params.data;

    if (useBackend) {
      await AnnotationsService.edit.put(
        selectionId,
        coordinates,
        metadata,
        body
      );
    }

    const data = _.cloneDeep(state.notes);
    const path = [chartName].filter(Boolean);
    const selections = [..._.get(data, path.join("."))];
    let newSelections = [];
    const selectionIndex = selections.findIndex(
      (selection) => selection.id === selectionId
    );
    if (selectionIndex !== -1) {
      newSelections = selections.map((selection, index) => {
        if (index === selectionIndex) {
          return params.data;
        } else {
          return selection;
        }
      });
    }
    _.set(data, path.join("."), newSelections);
    commit(SET_SELECTED_RECTANGLE, null);
    commit(SET_NOTES, { data });
    if (!useBackend) {
      localStorageService.set("notes", state.notes);
    }
  },

  async [DELETE_SELECTION]({ commit, getters, rootState, rootGetters }) {
    const chartName = getters.getSelectedRectangle.report;
    const selectionId = getters.getSelectedRectangle.item.id;

    const webApiEnabled = environment.WEB_API_ENABLED;
    const loggedIn = rootGetters.getWebAPIUser;
    const useAnnotationsApi = environment.USE_ANNOTATIONS_API;

    const useBackend = webApiEnabled
      ? loggedIn && useAnnotationsApi
      : useAnnotationsApi;

    if (useBackend) {
      const annotation = await AnnotationsService.delete.delete(selectionId);
    }
    const data = { ...getters.getNotes };
    const path = [chartName].filter(Boolean);
    const selections = _.get(data, path.join(".")).filter(
      (selection) => selection.id !== selectionId
    );

    _.set(data, path.join("."), selections);
    commit(SET_SELECTED_RECTANGLE, null);
    commit(SET_NOTES, { data });
    if (!useBackend) {
      localStorageService.set("notes", getters.getNotes);
    }
  },
  [SHOW_DIALOG]({ commit }, params) {
    commit(SET_DIALOG, {
      show: params.show,
      data: params.data,
      coordinates: params.coordinates,
      action: params.action,
    });
  },
  [SHOW_DATUM_NOTES]({ commit }) {
    commit(SET_SELECTED_RECTANGLE, null);
  },
};

const mutations = {
  [SET_NOTES](state, payload) {
    state.notes = payload.data;
  },
  [SET_DIALOG](state, payload) {
    state.dialog = payload;
  },
  [SET_SELECTED_RECTANGLE](state, payload) {
    state.selectedRectangle = payload;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
