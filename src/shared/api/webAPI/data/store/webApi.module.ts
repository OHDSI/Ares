import {
  FETCH_CONCEPTS_RECORD_COUNT,
  FETCH_VOCABULARIES,
  FETCH_VOCABULARY_SEARCH_RESULTS,
  FETCH_WEBAPI_INFO,
  RESET_API_STORAGE,
} from "@/shared/api/webAPI/data/store/actions.type";
import { InfoService } from "@/shared/api/webAPI/services/infoService";
import {
  CLEAR_API_STORAGE,
  SET_WEBAPI,
} from "@/shared/api/webAPI/data/store/mutations.type";
import { VocabularyService } from "@/shared/api/webAPI/services/vocabularyService";
import CookiesService from "@/shared/api/cookiesService";
import LocalStorageService from "@/shared/api/localStorageService";

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
  async [FETCH_WEBAPI_INFO]({ commit, dispatch, rootState, rootGetters }) {
    commit(SET_WEBAPI, { loading: true });
    const webApiInfo = InfoService.webApi.get(
      LocalStorageService.get("bearerToken")
    );
    const sources = InfoService.sources.get(
      LocalStorageService.get("bearerToken")
    );
    return await Promise.all([webApiInfo, sources])
      .then((res) => {
        commit(SET_WEBAPI, {
          serviceDetails: res[0].data,
          apiSources: res[1].data,
          loading: false,
        });
      })
      .catch((err) => commit(SET_WEBAPI, { loading: false, error: err.error }));
  },

  async [FETCH_VOCABULARIES](
    { commit, dispatch, rootState, rootGetters },
    payload
  ) {
    const vocabularies = VocabularyService.vocabularies.get(
      payload.source,
      LocalStorageService.get("bearerToken")
    );
    return await vocabularies;
  },

  async [FETCH_CONCEPTS_RECORD_COUNT](
    { commit, dispatch, rootState, rootGetters },
    payload
  ) {
    const conceptsRecordCount = VocabularyService.conceptRecordCont.get(
      payload.conceptsList,
      LocalStorageService.get("bearerToken")
    );

    return await conceptsRecordCount;
  },
  async [FETCH_VOCABULARY_SEARCH_RESULTS](
    { commit, dispatch, rootState, rootGetters },
    payload
  ) {
    commit(SET_WEBAPI, { loading: true });
    await VocabularyService.search
      .get(
        payload.search,
        payload.source,
        LocalStorageService.get("bearerToken"),
        payload.vocab_id
      )
      .then((data) => {
        commit(SET_WEBAPI, {
          data: data.data,
          payload,
          loading: false,
        });
      })
      .catch((err) => {
        commit(SET_WEBAPI, { loading: false, error: err });
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
