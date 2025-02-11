import {
  ADD_ALERT,
  RESET_ALERTS,
} from "@/widgets/snackbar/model/store/actions.type";
import {
  CLEAR_ALERTS,
  SET_ALERT,
  SET_ALERT_VISIBILITY,
} from "@/widgets/snackbar/model/store/mutations.type";

const state = {
  alert: {},
  showAlert: false,
};

const getters = {
  getAlert: function (state) {
    return state.alert;
  },
  getAlertVisibility: function (state) {
    return state.showAlert;
  },
};

const actions = {
  [ADD_ALERT]({ commit }, payload) {
    commit(SET_ALERT, payload);
    commit(SET_ALERT_VISIBILITY);
  },
  [RESET_ALERTS]({ commit }) {
    commit(CLEAR_ALERTS);
  },
};

const mutations = {
  [SET_ALERT](state, payload) {
    state.alert = payload;
  },
  [SET_ALERT_VISIBILITY](state) {
    state.showAlert = true;
  },
  [CLEAR_ALERTS](state) {
    state.alert = {};
    state.showAlert = false;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
