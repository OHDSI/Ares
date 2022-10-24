import {
  FETCH_VOCABULARY_SEARCH_RESULTS,
  FETCH_WEBAPI_INFO,
  RESET_API_STORAGE,
} from "@/shared/api/webAPI/store/actions.type";
import { InfoService } from "@/shared/api/webAPI/webApiServices/infoService";
import {
  CLEAR_API_STORAGE,
  SET_WEBAPI,
} from "@/shared/api/webAPI/store/mutations.type";
import { VocabularyService } from "@/shared/api/webAPI/webApiServices/vocabularyService";

const state = {
  apiData: {},
  apiError: {},
};

const getters = {
  getApiData: (state) => {
    return state.apiData;
  },
};

const actions = {
  async [FETCH_WEBAPI_INFO]({ commit }) {
    commit(SET_WEBAPI, { loading: true });
    const webApiInfo = await InfoService.webApi.get();
    const sources = await InfoService.sources.get();
    commit(SET_WEBAPI, {
      serviceDetails: webApiInfo.response.data,
      apiSources: sources.response.data,
      loading: false,
    });
  },

  async [FETCH_VOCABULARY_SEARCH_RESULTS](
    { commit, dispatch, rootState },
    payload
  ) {
    commit(SET_WEBAPI, { loading: true });
    await VocabularyService.search
      .get(payload.search, payload.source)
      .then((data) => {
        if (!data.response?.data) {
          commit(SET_WEBAPI, { loading: false, error: data.response });
        } else {
          commit(SET_WEBAPI, {
            data: data.response.data,
            payload,
            loading: false,
          });
        }
      });
  },
  [RESET_API_STORAGE]({ commit }) {
    commit(CLEAR_API_STORAGE);
  },
};

const mutations = {
  [SET_WEBAPI](state, payload) {
    state.apiData = payload;
  },
  [CLEAR_API_STORAGE](state) {
    state.apiData = {};
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
