import {
  NEW_ERROR,
  RESET_ERRORS,
} from "@/data/store/modules/errors/actions.type";
import {
  ADD_ERROR,
  CLEAR_ERRORS,
} from "@/data/store/modules/errors/mutations.type";

const state = {
  errors: [],
};

const getters = {
  getErrors: (state) => {
    return state.errors.length > 0 ? state.errors : null;
  },
};

const actions = {
  [NEW_ERROR]({ commit }, params) {
    //We may add error preprocessing in the future if such a need arises
    commit(NEW_ERROR, params);
  },
  [RESET_ERRORS]({ commit }, params) {
    commit(CLEAR_ERRORS, params);
  },
};

const mutations = {
  [ADD_ERROR](state, error) {
    state.errors = [...state.errors, error];
  },
  [CLEAR_ERRORS](state) {
    state.errors = [];
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
