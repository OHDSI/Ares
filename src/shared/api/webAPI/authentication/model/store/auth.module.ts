import { SAVE_TOKEN, SET_USER } from "./mutations.type";
import { WEB_API_LOG_IN, GET_USER, LOG_OUT } from "./actions.type";
import { authService } from "@/shared/api/webAPI/services/authService";
import { ADD_ALERT } from "@/widgets/snackbar/model/store/actions.type";
import environment from "@/shared/api/environment";
import CookiesService from "@/shared/api/cookiesService";
import { jwtDecode } from "jwt-decode";
import localStorageService from "@/shared/api/localStorageService";

const tokenKey = "bearerToken";

const state = {
  user: null,
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
    const token = CookiesService.get(tokenKey);
    return token && !checkExpiryDate(token);
  },
  getWebAPIUser: function (state) {
    return state.user;
  },
};

const actions = {
  // async [WEB_API_LOG_IN]({ commit, dispatch }) {
  //   if (environment.WEB_API_ENABLED === "false") {
  //     return;
  //   }
  //   const savedToken = CookiesService.get(bearerToken);
  //   const isExpired = checkExpiryDate(savedToken);
  //
  //   if (!savedToken || isExpired) {
  //     return await authService.token
  //       .get()
  //       .then((data) => {
  //         const token = data.headers?.["bearer"];
  //         CookiesService.set(bearerToken, token, getExpiryDate(token));
  //         authService.user.get(token).then((data) => {
  //           const user = data.data;
  //           commit(SET_USER, user);
  //         });
  //       })
  //       .catch((error) => {
  //         dispatch(ADD_ALERT, {
  //           message: "Could not authenticate",
  //           status: error.message ? error.message : "No additional data",
  //         });
  //         return;
  //       });
  //   }
  // },

  async [WEB_API_LOG_IN]({ commit, dispatch }) {
    if (environment.WEB_API_ENABLED === "false") {
      return;
    }
    try {
      const savedToken = CookiesService.get(tokenKey);
      const isExpired = checkExpiryDate(savedToken);

      let token = savedToken;
      if (!savedToken || isExpired) {
        const { headers } = await authService.token.get();
        token = headers?.["bearer"];
        if (!token) throw new Error("Token not found");
        CookiesService.set(tokenKey, token, getExpiryDate(token));
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
    if (!CookiesService.get(tokenKey)) return;
    const isExpired = checkExpiryDate(CookiesService.get(tokenKey));

    if (isExpired) {
      dispatch(LOG_OUT);
      return;
    }
    const userData = await authService.user.get(CookiesService.get(tokenKey));
    const user = await userData.data;
    user.exp = new Date(
      getExpiryDate(CookiesService.get(tokenKey)) * 1000
    ).toUTCString();
    commit(SET_USER, user);
  },
  async [LOG_OUT]({ commit, dispatch, rootGetters }) {
    CookiesService.remove(tokenKey);
    localStorageService.remove("user");
    commit(SET_USER, null);
    if (!checkExpiryDate(CookiesService.get(tokenKey))) {
      await authService.token.logout(CookiesService.get(tokenKey));
    }
  },
};
const mutations = {
  [SET_USER](state, user) {
    state.user = user;
    localStorageService.set("user", user);
  },
  [SAVE_TOKEN](state, token) {
    CookiesService.set("bearerToken", token, 1);
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
