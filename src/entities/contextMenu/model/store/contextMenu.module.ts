import { SET_LOCATION } from "@/entities/contextMenu/model/store/mutations.type";
import { SET_CONTEXT_MENU_VISIBILITY } from "@/entities/contextMenu/model/store/mutations.type";
import { OPEN_MENU } from "@/entities/contextMenu/model/store/actions.type";

const state = {
  visible: false,
  location: {},
};

const getters = {
  getContextMenuVisibility: function (state) {
    return state.visible;
  },
  getContextMenuLocation: function (state) {
    return state.location;
  },
};

const actions = {
  [OPEN_MENU]({ commit }, payload) {
    commit(SET_LOCATION, payload.location);
    commit(SET_CONTEXT_MENU_VISIBILITY, payload.visibility);
  },
};

const mutations = {
  [SET_LOCATION](state, payload) {
    state.location = payload;
  },
  [SET_CONTEXT_MENU_VISIBILITY](state, payload) {
    state.visible = payload;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
