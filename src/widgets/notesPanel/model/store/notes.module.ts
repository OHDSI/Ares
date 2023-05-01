import localStorageService from "@/shared/api/localStorageService";
import {
  ADD_NEW_NOTE,
  CREATE_SELECTION,
  DELETE_METADATA_CARD,
  DELETE_SELECTION,
  EDIT_METADATA_CARD,
  EDIT_SELECTION,
  IMPORT_NOTES_FROM_FILE,
  LOAD_NOTES,
  SHOW_DATUM_NOTES,
  SHOW_DIALOG,
} from "@/widgets/notesPanel/model/store/actions.type";

import {
  REMOVE_METADATUM,
  SET_CURRENT_SELECTION_AREA,
  SET_LOADED_NOTES,
  SET_NOTES,
  SET_SELECTED_RECTANGLE,
  SET_DIALOG,
  SET_CLICK_EVENT_DATA,
} from "@/widgets/notesPanel/model/store/mutations.type";
import { SET_SETTINGS } from "@/widgets/settings/model/store/mutations.type";

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
  getClickEventData: function (state) {
    return state.clickEventData;
  },
  getCurrentSelectionArea: function (state) {
    return state.currentSelectionArea;
  },
  getSelectedRectangle: function (state) {
    return state.selectedRectangle;
  },
};

const actions = {
  [IMPORT_NOTES_FROM_FILE]({ commit }, params) {
    commit(SET_LOADED_NOTES, params);
  },
  [LOAD_NOTES]({ commit }) {
    if (localStorageService.get("notes")) {
      commit(SET_NOTES, localStorageService.get("notes"));
    }
  },
  [DELETE_METADATA_CARD]({ commit, getters }, params) {
    const sourceName = getters.getSelectedSource?.cdm_source_key;
    const releaseName = getters.getSelectedRelease?.release_id;
    const reportName = getters.getSelectedRectangle.report;
    const report = getters.getNotes[sourceName][releaseName][reportName].filter(
      (value) => value.id !== getters.getSelectedRectangle.item.id
    );

    let selection = getters.getNotes[sourceName][releaseName][
      reportName
    ].filter((value) => value.id === getters.getSelectedRectangle.item.id)[0];

    selection = {
      ...selection,
      notes: [...selection.notes.filter((value) => value.id !== params.cardId)],
    };

    report.push(selection);

    const release = {
      ...getters.getNotes[sourceName][releaseName],
      [reportName]: report,
    };
    const source = {
      ...getters.getNotes[sourceName],
      [getters.getSelectedRelease.release_id]: release,
    };

    const data = {
      ...getters.getNotes,
      [sourceName]: source,
    };
    commit(SET_NOTES, data);
    localStorageService.set("notes", getters.getNotes);
  },
  [EDIT_METADATA_CARD]({ commit, getters }, params) {
    const sourceName = getters.getSelectedSource?.cdm_source_key;
    const releaseName = getters.getSelectedRelease?.release_id;
    const reportName = getters.getSelectedRectangle.report;
    const report = getters.getNotes[sourceName][releaseName][reportName].filter(
      (value) => value.id !== getters.getSelectedRectangle.item.id
    );

    let selection = getters.getNotes[sourceName][releaseName][
      reportName
    ].filter((value) => value.id === getters.getSelectedRectangle.item.id)[0];

    const datum = {
      title: params.data.title,
      description: params.data.description,
      id: Date.now(),
    };

    selection = {
      ...selection,
      notes: [
        ...selection.notes.map((value) =>
          value.id === params.cardId ? datum : value
        ),
      ],
    };

    report.push(selection);

    const release = {
      ...getters.getNotes[sourceName][releaseName],
      [reportName]: report,
    };
    const source = {
      ...getters.getNotes[sourceName],
      [getters.getSelectedRelease.release_id]: release,
    };

    const data = {
      ...getters.getNotes,
      [sourceName]: source,
    };
    commit(SET_NOTES, data);
    localStorageService.set("notes", getters.getNotes);
  },
  [ADD_NEW_NOTE]({ commit, getters }, params) {
    const sourceName = getters.getSelectedSource?.cdm_source_key;
    const releaseName = getters.getSelectedRelease?.release_id;
    const reportName = getters.getSelectedRectangle.report;
    const report = getters.getNotes[sourceName][releaseName][reportName].filter(
      (value) => value.id !== getters.getSelectedRectangle.item.id
    );
    const datum = {
      title: params.data.title,
      description: params.data.description,
      id: Date.now(),
    };

    let selection = getters.getNotes[sourceName][releaseName][
      reportName
    ].filter((value) => value.id === getters.getSelectedRectangle.item.id)[0];

    selection = {
      ...selection,
      notes: [...selection.notes, datum],
    };

    report.push(selection);

    const release = {
      ...getters.getNotes[sourceName][releaseName],
      [reportName]: report,
    };
    const source = {
      ...getters.getNotes[sourceName],
      [getters.getSelectedRelease.release_id]: release,
    };

    const data = {
      ...getters.getNotes,
      [sourceName]: source,
    };
    commit(SET_NOTES, data);
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
  [CREATE_SELECTION]({ commit, getters }, params) {
    const sourceName = getters.getSelectedSource.cdm_source_key;
    const releaseName = getters.getSelectedRelease.release_id;
    let source = getters.getSelectedSource
      ? getters.getNotes[sourceName] || []
      : null;
    let release = getters.getSelectedRelease
      ? getters.getNotes[sourceName][releaseName] || []
      : null;
    const chartName = params.reportName;
    const report =
      getters.getNotes[sourceName]?.[releaseName]?.[chartName] || [];
    const coordinates = getters.getCurrentSelectionArea.event;
    const selection = {
      start: coordinates.start[0],
      end: coordinates.start[1],
      y: coordinates.y[0],
      y1: coordinates.y[1],
      title: params.title,
      description: params.description,
      notes: [],
      id: Date.now(),
    };
    console.log(release);

    report.push(selection);
    release = { ...release, [chartName]: report };
    source = { ...source, [releaseName]: release };
    const data = {
      ...getters.getNotes,
      [sourceName]: source,
    };

    commit(SET_NOTES, data);
    localStorageService.set("notes", getters.getNotes);
  },
  [DELETE_SELECTION]({ commit, getters }, params) {
    const sourceName = getters.getSelectedSource?.cdm_source_key;
    const releaseName = getters.getSelectedRelease?.release_id;
    const reportName = getters.getSelectedRectangle.report;
    const report = getters.getNotes[sourceName][releaseName][reportName].filter(
      (value) => value.id !== getters.getSelectedRectangle.item.id
    );

    const release = {
      ...getters.getNotes[sourceName][releaseName],
      [reportName]: report,
    };
    const source = {
      ...getters.getNotes[sourceName],
      [getters.getSelectedRelease.release_id]: release,
    };
    const data = {
      ...getters.getNotes,
      [sourceName]: source,
    };
    commit(SET_NOTES, data);
    localStorageService.set("notes", getters.getNotes);
  },
  [EDIT_SELECTION]({ commit, getters }, params) {
    const sourceName = getters.getSelectedSource?.cdm_source_key;
    const releaseName = getters.getSelectedRelease?.release_id;
    const reportName = getters.getSelectedRectangle.report;
    let selection = getters.getNotes[sourceName][releaseName][
      reportName
    ].filter((value) => value.id === getters.getSelectedRectangle.item.id)[0];

    selection = {
      ...selection,
      title: params.data.title,
      description: params.data.description,
    };

    const report = getters.getNotes[sourceName][releaseName][reportName].filter(
      (value) => value.id !== getters.getSelectedRectangle.item.id
    );

    report.push(selection);

    const release = {
      ...getters.getNotes[sourceName][releaseName],
      [reportName]: report,
    };
    const source = {
      ...getters.getNotes[sourceName],
      [getters.getSelectedRelease.release_id]: release,
    };

    const data = {
      ...getters.getNotes,
      [sourceName]: source,
    };
    commit(SET_NOTES, data);
    localStorageService.set("notes", getters.getNotes);
  },
};

const mutations = {
  [SET_NOTES](state, payload) {
    state.notes = payload;
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

/*
 * TODO: Load notes from external file and save to local storage (the file or the parsed data?)
 * TODO: Load notes from local storage if present
 * TODO: Merge new notes and loaded notes on save (do we really need to separate the old and the new?)
 * TODO: Where do we read the file (store or the UI component). I'm thinking of store for now.
 * TODO:
 *
 *  */
