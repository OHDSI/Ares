import { SET_ACCESS_TOKEN } from "./mutations.type";
import { GET_AUTH_TOKEN } from "./actions.type";
import { authService } from "@/shared/api/webAPI/services/authService";
import { ADD_ALERT } from "@/widgets/snackbar/model/store/actions.type";
import environment from "@/shared/api/environment";

const state = {
  accessToken: null,
};

const getters = {
  getWebAPIToken: function (state) {
    return state.accessToken;
  },
  authenticated: function (state) {
    return !!state.accessToken;
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
};
const mutations = {
  [SET_ACCESS_TOKEN](state, token) {
    state.accessToken = token;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
