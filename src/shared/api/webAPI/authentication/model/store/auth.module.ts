import { SAVE_TOKEN, SET_AUTHENTICATED, SET_USER } from "./mutations.type";
import { WEB_API_LOG_IN, GET_USER, LOG_OUT } from "./actions.type";
import { authService } from "@/shared/api/webAPI/services/authService";
import { ADD_ALERT } from "@/widgets/snackbar/model/store/actions.type";
import environment from "@/shared/api/environment";
import { jwtDecode } from "jwt-decode";
import LocalStorageService from "@/shared/api/localStorageService";
import cookiesService from "@/shared/api/cookiesService";
import localStorageService from "@/shared/api/localStorageService";

const tokenKey = "bearerToken";

const state = {
  user: null,
  authenticated: false,
};

function checkExpiryDate(token) {
  if (token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  }
}

function getExpiryDate(token) {
  const decodedToken = jwtDecode(token);
  return decodedToken.exp;
}

const getters = {
  authenticated: function (state) {
    return state.authenticated;
  },
  getWebAPIUser: function (state) {
    return state.user;
  },
};

const actions = {
  async [WEB_API_LOG_IN]({ commit, dispatch }) {
    if (environment.WEB_API_ENABLED === "false") {
      return;
    }
    try {
      const savedToken = LocalStorageService.get(tokenKey);
      const isExpired = checkExpiryDate(savedToken);

      let token = savedToken;
      if (!savedToken || isExpired) {
        const { headers } = await authService.token.get();
        token = headers?.["bearer"];
        if (!token) throw new Error("Token not found");
        commit(SAVE_TOKEN, token);
      }
      dispatch(GET_USER);
    } catch (error) {
      dispatch(ADD_ALERT, {
        message: "Could not authenticate",
        status: error.message ? error.message : "No additional data",
      });
    }
  },
  async [GET_USER]({ commit, dispatch, rootGetters }) {
    if (environment.WEB_API_ENABLED === "false") return;
    if (!LocalStorageService.get(tokenKey)) return;
    const isExpired = checkExpiryDate(LocalStorageService.get(tokenKey));

    if (isExpired) {
      dispatch(LOG_OUT);
      return;
    }
    const userData = await authService.user.get(
      LocalStorageService.get(tokenKey)
    );
    const user = await userData.data;
    user.exp = new Date(
      getExpiryDate(LocalStorageService.get(tokenKey)) * 1000
    ).toLocaleString();
    commit(SET_AUTHENTICATED, true);
    commit(SET_USER, user);
    const checkAuthStatus = setInterval(() => {
      if (
        checkExpiryDate(LocalStorageService.get(tokenKey)) ||
        !localStorageService.get(tokenKey)
      ) {
        dispatch(LOG_OUT, {
          message: "The session has expired. Please log in again",
        });
        clearInterval(checkAuthStatus);
      }
    }, 1000);
  },
  async [LOG_OUT]({ commit, dispatch, rootGetters }, payload) {
    commit(SET_AUTHENTICATED, false);
    commit(SET_USER, null);
    if (!checkExpiryDate(LocalStorageService.get(tokenKey))) {
      await authService.token.logout(LocalStorageService.get(tokenKey));
    }
    LocalStorageService.remove(tokenKey);
    cookiesService.remove(tokenKey);
    LocalStorageService.remove("user");
    dispatch(ADD_ALERT, {
      message: payload?.message ? payload.message : "You have been logged out",
      status: "",
    });
  },
};
const mutations = {
  [SET_USER](state, user) {
    state.user = user;
    LocalStorageService.set("user", user);
  },
  [SAVE_TOKEN](state, token) {
    LocalStorageService.set("bearerToken", token);
    cookiesService.set("bearerToken", token, getExpiryDate(token));
  },
  [SET_AUTHENTICATED](state, authenticated) {
    state.authenticated = authenticated;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
