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
};

const getters = {
  getApiData: (state) => {
    return state.apiData;
  },
};

const actions = {
  async [FETCH_WEBAPI_INFO]({ commit }) {
    const webApiInfo = await InfoService.webApi.get();
    const sources = await InfoService.sources.get();
    commit(SET_WEBAPI, {
      serviceDetails: webApiInfo.response.data,
      apiSources: sources.response.data,
    });
  },

  async [FETCH_VOCABULARY_SEARCH_RESULTS](
    { commit, dispatch, rootState },
    payload
  ) {
    await VocabularyService.search
      .get(payload.search)
      .then((data) =>
        commit(SET_WEBAPI, { data: data.response.data, payload })
      );
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
