import { SET_ACCESS_TOKEN, SET_USER } from "./mutations.type";
import { GET_AUTH_TOKEN, GET_USER } from "./actions.type";
import { authService } from "@/shared/api/webAPI/services/authService";
import { ADD_ALERT } from "@/widgets/snackbar/model/store/actions.type";
import environment from "@/shared/api/environment";

const state = {
  accessToken: null,
  user: null,
};

const getters = {
  getWebAPIToken: function (state) {
    return state.accessToken;
  },
  authenticated: function (state) {
    return !!state.accessToken;
  },
  getWebAPIUser: function (state) {
    return state.user;
  },
};

const actions = {
  async [GET_AUTH_TOKEN]({ commit, dispatch }) {
    if (environment.WEB_API_ENABLED === "false") {
      return;
    }
    return await authService.token
      .get()
      .then((data) => {
        const token = data.headers?.["bearer"];
        commit(SET_ACCESS_TOKEN, token);
      })
      .catch((error) => {
        dispatch(ADD_ALERT, {
          message: "Could not authenticate",
          status: error.message ? error.message : "No additional data",
        });
        return;
      });
  },
  async [GET_USER]({ commit, rootGetters }) {
    if (environment.WEB_API_ENABLED === "false") {
      return;
    }
    return await authService.user
      .get(rootGetters.getWebAPIToken)
      .then((data) => {
        const user = data.data;
        commit(SET_USER, user);
      });
  },
};
const mutations = {
  [SET_ACCESS_TOKEN](state, token) {
    state.accessToken = token;
  },
  [SET_USER](state, user) {
    state.user = user;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
