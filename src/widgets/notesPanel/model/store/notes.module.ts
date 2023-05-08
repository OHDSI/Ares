import localStorageService from "@/shared/api/localStorageService";
import {
  ADD_NEW_NOTE,
  CREATE_SELECTION,
  DELETE_NOTE,
  DELETE_SELECTION,
  EDIT_NOTE,
  EDIT_SELECTION,
  LOAD_NOTES,
  SHOW_DATUM_NOTES,
  SHOW_DIALOG,
} from "@/widgets/notesPanel/model/store/actions.type";
import _ from "lodash";
import {
  createNestedProperty,
  createNewNote,
  createSelection,
  mergeAndCompareByDate,
} from "@/widgets/notesPanel/model/lib/helpers";

import {
  SET_CURRENT_SELECTION_AREA,
  SET_NOTES,
  SET_SELECTED_RECTANGLE,
  SET_DIALOG,
  SET_CLICK_EVENT_DATA,
} from "@/widgets/notesPanel/model/store/mutations.type";
import apiService from "@/shared/api/apiService";
import getFilePath from "@/shared/api/getFilePath";
import { NOTES } from "@/shared/config/files";

const state = {
  notes: {},
  dialog: { show: false, data: {}, action: null },
  clickEventData: {},
  currentSelectionArea: "",
  selectedRectangle: null,
};

const getters = {
  getNotes: function (state) {
    return state.notes;
  },
  getDialogData: function (state) {
    return state.dialog;
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
    const newSelection = createSelection(
      getters.getCurrentSelectionArea.event,
      params
    );
    let data = { ...getters.getNotes };
    const path = [cdm, release, domain, concept, chartName].filter(Boolean);
    data = createNestedProperty(data, path);
    _.get(data, path.join(".")).push(newSelection);
    commit(SET_NOTES, { data, cdm });
    localStorageService.set("notes", getters.getNotes);
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

  [EDIT_SELECTION]({ commit, getters, rootState }, params) {
    const { cdm, release, domain, concept } = rootState.route.params;
    const chartName = getters.getSelectedRectangle.report;
    const selectionId = getters.getSelectedRectangle.item.id;

    const data = { ...getters.getNotes };
    const path = [cdm, release, domain, concept, chartName].filter(Boolean);
    const selections = _.get(data, path.join("."));

    const findSelectionById = (id, selections) =>
      selections.find((selection) => selection.id === id);

    const selectionIndex = selections.findIndex(
      (selection) => selection.id === selectionId
    );
    if (selectionIndex !== -1) {
      const selection = findSelectionById(selectionId, selections);
      const updatedSelection = {
        ...selection,
        title: params.data.title,
        description: params.data.description,
      };
      selections[selectionIndex] = updatedSelection;
    }

    _.set(data, path.join("."), selections);

    commit(SET_NOTES, { data, cdm });
    localStorageService.set("notes", getters.getNotes);
  },
  [DELETE_NOTE]({ commit, getters, rootState }, params) {
    const { cdm, release, domain, concept } = rootState.route.params;
    const chartName = getters.getSelectedRectangle.report;
    const selectionId = getters.getSelectedRectangle.item.id;

    const data = { ...getters.getNotes };
    const path = [cdm, release, domain, concept, chartName].filter(Boolean);
    const selections = _.get(data, path.join("."));

    const findSelectionById = (id, selections) =>
      selections.find((selection) => selection.id === id);

    const selectionIndex = selections.findIndex(
      (selection) => selection.id === selectionId
    );
    if (selectionIndex !== -1) {
      const selection = findSelectionById(selectionId, selections);
      const updatedSelection = {
        ...selection,
        notes: [
          ...selection.notes.filter((value) => value.id !== params.cardId),
        ],
      };
      selections[selectionIndex] = updatedSelection;
    }

    _.set(data, path.join("."), selections);

    commit(SET_NOTES, { data, cdm });
    localStorageService.set("notes", getters.getNotes);
  },
  [EDIT_NOTE]({ commit, getters, rootState }, params) {
    const { cdm, release, domain, concept } = rootState.route.params;
    const chartName = getters.getSelectedRectangle.report;
    const selectionId = getters.getSelectedRectangle.item.id;

    const data = { ...getters.getNotes };
    const path = [cdm, release, domain, concept, chartName].filter(Boolean);
    const selections = _.get(data, path.join("."));

    const findSelectionById = (id, selections) =>
      selections.find((selection) => selection.id === id);

    const selectionIndex = selections.findIndex(
      (selection) => selection.id === selectionId
    );
    if (selectionIndex !== -1) {
      const selection = findSelectionById(selectionId, selections);
      const updatedSelection = {
        ...selection,
        notes: [
          ...selection.notes.map((value) =>
            value.id === params.cardId
              ? createNewNote(params.data.title, params.data.description)
              : value
          ),
        ],
      };
      selections[selectionIndex] = updatedSelection;
    }

    _.set(data, path.join("."), selections);

    commit(SET_NOTES, { data, cdm });
    localStorageService.set("notes", getters.getNotes);
  },
  [ADD_NEW_NOTE]({ commit, getters, rootState }, params) {
    const { cdm, release, domain, concept } = rootState.route.params;
    const chartName = getters.getSelectedRectangle.report;
    const selectionId = getters.getSelectedRectangle.item.id;

    const data = { ...getters.getNotes };
    const path = [cdm, release, domain, concept, chartName].filter(Boolean);
    const selections = _.get(data, path.join("."));

    const findSelectionById = (id, selections) =>
      selections.find((selection) => selection.id === id);

    const selectionIndex = selections.findIndex(
      (selection) => selection.id === selectionId
    );
    if (selectionIndex !== -1) {
      const selection = findSelectionById(selectionId, selections);
      selection.notes.push(
        createNewNote(params.data.title, params.data.description)
      );
      selections[selectionIndex] = selection;
    }

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
  [SET_DIALOG](state, payload) {
    state.dialog = payload;
  },
  [SET_CLICK_EVENT_DATA](state, payload) {
    state.clickEventData = payload;
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