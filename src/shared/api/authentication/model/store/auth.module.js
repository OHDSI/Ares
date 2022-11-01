import {
  GET_TOKEN,
  LOG_IN,
  SET_DEFAULT_STATE,
} from "@/shared/api/authentication/model/store/actions.type";
import { PublicClientApplication } from "@azure/msal-browser";
import { getAuthConfig } from "@/shared/api/authentication/config";
import {
  SET_ACCESS_TOKEN,
  SET_USER_ACCOUNT,
} from "@/shared/api/authentication/model/store/mutations.type";

const state = {
  accessToken: null,
  account: null,
};

const getters = {
  getToken: function (state) {
    return state.accessToken;
  },
  getUserAccount: function (state) {
    return state.account;
  },
};

const actions = {
  async [SET_DEFAULT_STATE]({ commit }) {
    const msalInstance = new PublicClientApplication(getAuthConfig());
    const currentAccount = msalInstance.getAllAccounts()[0];
    if (currentAccount) {
      await msalInstance
        .acquireTokenSilent({
          scopes: ["User.Read"],
          account: currentAccount,
        })
        .then((response) => {
          commit(SET_ACCESS_TOKEN, response.accessToken);
          commit(SET_USER_ACCOUNT, response.account);
        })
        .catch();
    }
  },
  async [LOG_IN]({ commit }) {
    const msalInstance = new PublicClientApplication(getAuthConfig());
    msalInstance
      .acquireTokenPopup({
        scopes: ["User.Read"],
      })
      .then((response) => {
        commit(SET_ACCESS_TOKEN, response.accessToken);
        commit(SET_USER_ACCOUNT, response.account);
      });
  },
  async [GET_TOKEN]({ commit }) {
    const msalInstance = new PublicClientApplication(getAuthConfig());
    const currentAccount = msalInstance.getAllAccounts()[0];
    return msalInstance
      .acquireTokenSilent({
        scopes: ["User.Read"],
        account: currentAccount,
      })
      .then((response) => {
        commit(SET_ACCESS_TOKEN, response.accessToken);
        commit(SET_USER_ACCOUNT, response.account);
      })
      .catch((e) => {
        msalInstance
          .acquireTokenPopup({
            scopes: ["User.Read"],
            account: currentAccount,
          })
          .then((response) => {
            commit(SET_ACCESS_TOKEN, response.accessToken);
            commit(SET_USER_ACCOUNT, response.account);
          });
      });
  },
};

const mutations = {
  [SET_ACCESS_TOKEN](state, token) {
    state.accessToken = token;
  },
  [SET_USER_ACCOUNT](state, account) {
    state.account = account.name;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
