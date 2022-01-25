import {
  ADD_ERROR,
  CLEAR_ERRORS,
} from "@/data/store/modules/errors/actions.type";

const state = {
  errors: [],
};

const getters = {
  getErrors: (state) => {
    return state.errors.length > 0 ? state.errors : null;
  },
};

const actions = {
  [ADD_ERROR]({ commit }, params) {
    commit(ADD_ERROR, params);
  },
  [CLEAR_ERRORS]({ commit }, params) {
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
