import localStorageService from "@/shared/api/localStorageService";
import {
  CREATE_SELECTION,
  DELETE_SELECTION,
  EDIT_SELECTION,
  EXPORT_NOTES,
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

  [CREATE_SELECTION]({ commit, getters, rootState }, params) {
    const chartName = params.reportName;

    let data = { ...getters.getNotes };
    const path = [chartName].filter(Boolean);
    data = createNestedProperty(data, path);
    _.get(data, path.join(".")).push(params.selection);
    commit(SET_NOTES, { data });
    commit(SET_SELECTED_RECTANGLE, null);
    localStorageService.set("notes", getters.getNotes);
  },

  [EDIT_SELECTION]({ commit, state, getters, rootState }, params) {
    const chartName = getters.getSelectedRectangle?.report || params.report;
    const selectionId =
      getters.getSelectedRectangle?.item?.id || params.data.id;

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
    localStorageService.set("notes", state.notes);
  },

  [DELETE_SELECTION]({ commit, getters, rootState }) {
    const chartName = getters.getSelectedRectangle.report;
    const selectionId = getters.getSelectedRectangle.item.id;

    const data = { ...getters.getNotes };
    const path = [chartName].filter(Boolean);
    const selections = _.get(data, path.join(".")).filter(
      (selection) => selection.id !== selectionId
    );

    _.set(data, path.join("."), selections);
    commit(SET_SELECTED_RECTANGLE, null);
    commit(SET_NOTES, { data });
    localStorageService.set("notes", getters.getNotes);
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
