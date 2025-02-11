import {
  NEW_ERROR,
  RESET_ERRORS,
} from "@/widgets/error/model/store/actions.type";
import {
  ADD_ERROR,
  CLEAR_ERRORS,
} from "@/widgets/error/model/store/mutations.type";
import { Error } from "@/widgets/error/model/interfaces/Error";

const state = {
  errors: [],
};

const getters = {
  getErrors: (state): Error[] | null => {
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
