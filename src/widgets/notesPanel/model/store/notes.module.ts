import localStorageService from "@/shared/api/localStorageService";
import {
  CREATE_SELECTION,
  DELETE_SELECTION,
  EDIT_SELECTION,
  LOAD_NOTES,
  MOVE_SELECTION,
  SHOW_DATUM_NOTES,
  SHOW_DIALOG,
} from "@/widgets/notesPanel/model/store/actions.type";
import _ from "lodash";
import {
  createNestedProperty,
  mergeAndCompareByDate,
} from "@/widgets/notesPanel/model/lib/helpers";

import {
  SET_CURRENT_SELECTION_AREA,
  SET_NOTES,
  SET_SELECTED_RECTANGLE,
  SET_DIALOG,
  SET_CLICK_EVENT_DATA,
  SET_RESIZE_SELECTION,
  SET_TEMP_NOTES,
} from "@/widgets/notesPanel/model/store/mutations.type";
import apiService from "@/shared/api/apiService";
import getFilePath from "@/shared/api/getFilePath";
import { NOTES } from "@/shared/config/files";

const state = {
  notes: {},
  tempNotes: null,
  dialog: { show: false, data: {}, action: null },
  clickEventData: {},
  currentSelectionArea: "",
  selectedRectangle: null,
  selectionForResize: null,
};

const getters = {
  getNotes: function (state) {
    if (state.tempNotes) {
      return state.tempNotes;
    } else {
      return state.notes;
    }
  },
  getDialogData: function (state) {
    return state.dialog;
  },
  getResizeSelection: function (state) {
    return state.selectionForResize;
  },
  getCurrentSelectionArea: function (state) {
    return state.currentSelectionArea;
  },
  getSelectedRectangle: function (state) {
    return state.selectedRectangle;
  },
};

const actions = {
  async [LOAD_NOTES]({ commit, rootGetters }) {
    await Promise.allSettled(
      rootGetters.getSources.map((source) =>
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
          return {
            ...object,
            [response.value.payload.source.cdm_source_key]: response.value.data,
          };
        }
        return object;
      }, {});
      const notes = localStorageService.get("notes")
        ? mergeAndCompareByDate(localStorageService.get("notes"), loadedData)
        : loadedData;

      commit(SET_NOTES, { data: notes });
    });
  },

  [CREATE_SELECTION]({ commit, getters, rootState }, params) {
    const { cdm, release, domain, concept } = rootState.route.params;
    const chartName = params.reportName;

    let data = { ...getters.getNotes };
    const path = [cdm, release, domain, concept, chartName].filter(Boolean);
    data = createNestedProperty(data, path);
    _.get(data, path.join(".")).push(params.selection);
    commit(SET_NOTES, { data, cdm });
    localStorageService.set("notes", getters.getNotes);
  },

  [EDIT_SELECTION]({ commit, state, getters, rootState }, params) {
    if (!params.save) {
      commit(SET_TEMP_NOTES, { data: { ...state.notes } });
      commit(SET_RESIZE_SELECTION, {
        ...getters.getSelectedRectangle.item,
        report: getters.getSelectedRectangle.report,
      });
    }
    const { cdm, release, domain, concept } = rootState.route.params;
    const chartName = getters.getSelectedRectangle?.report || params.report;
    const selectionId =
      getters.getSelectedRectangle?.item?.id || params.data.id;

    const data = _.cloneDeep(state.notes);
    const path = [cdm, release, domain, concept, chartName].filter(Boolean);
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
    if (!params.save) {
      commit(SET_TEMP_NOTES, { data, cdm });
    }

    if (params.save) {
      commit(SET_NOTES, { data, cdm });
      commit(SET_TEMP_NOTES, { data: null });
      commit(SET_RESIZE_SELECTION, null);
      localStorageService.set("notes", state.notes);
    }
  },

  [DELETE_SELECTION]({ commit, getters, rootState }) {
    const { cdm, release, domain, concept } = rootState.route.params;
    const chartName = getters.getSelectedRectangle.report;
    const selectionId = getters.getSelectedRectangle.item.id;

    const data = { ...getters.getNotes };
    const path = [cdm, release, domain, concept, chartName].filter(Boolean);
    const selections = _.get(data, path.join(".")).filter(
      (selection) => selection.id !== selectionId
    );

    _.set(data, path.join("."), selections);

    commit(SET_NOTES, { data, cdm });
    localStorageService.set("notes", getters.getNotes);
  },
  [SHOW_DIALOG]({ commit }, params) {
    commit(SET_CLICK_EVENT_DATA, params.clickEventData);
    commit(SET_DIALOG, {
      show: params.show,
      data: params.data,
      action: params.action,
    });
  },
  [SHOW_DATUM_NOTES]({ commit }, params) {
    commit(SET_CURRENT_SELECTION_AREA, params);
    commit(SET_SELECTED_RECTANGLE, null);
  },
};

const mutations = {
  [SET_NOTES](state, payload) {
    if (payload.cdm) {
      state.notes = {
        ...payload.data,
        [payload.cdm]: { ...payload.data[payload.cdm], date: Date.now() },
      };
    } else {
      state.notes = payload.data;
    }
  },
  [SET_TEMP_NOTES](state, payload) {
    if (payload.cdm) {
      state.tempNotes = {
        ...payload.data,
        [payload.cdm]: { ...payload.data[payload.cdm], date: Date.now() },
      };
    } else {
      state.tempNotes = payload.data;
    }
  },
  [SET_DIALOG](state, payload) {
    state.dialog = payload;
  },
  [SET_CLICK_EVENT_DATA](state, payload) {
    state.clickEventData = payload;
  },
  [SET_RESIZE_SELECTION](state, payload) {
    state.selectionForResize = payload;
  },
  [SET_CURRENT_SELECTION_AREA](state, payload) {
    state.currentSelectionArea = payload;
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
