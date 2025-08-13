import environment from "@/shared/api/environment";
import apiService from "@/shared/api/axios/apiService";

export const VocabularyService = {
  search: {
    get(
      query: string,
      source: string,
      token: string,
      vocab_id: string[] = null
    ) {
      return apiService(
        {
          url: `${environment.WEB_API_URL}vocabulary/${source}/search/`,
          baseURL: "./",
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : null,
          },
          data: {
            QUERY: query,
            VOCABULARY_ID: vocab_id,
          },
        },
        {}
      );
    },
  },
  vocabularies: {
    get(source: string, token: string) {
      return apiService(
        {
          url: `${environment.WEB_API_URL}vocabulary/${source}/vocabularies`,
          baseURL: "./",
          method: "get",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : null,
          },
        },
        {}
      );
    },
  },
  conceptRecordCont: {
    get(conceptsList: string, token: string) {
      return apiService(
        {
          url: `${environment.WEB_API_URL}cdmresults/${environment.CDM_NETWORK_NAME}/conceptRecordCount`,
          baseURL: "./",
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : null,
          },
          data: conceptsList,
        },
        {}
      );
    },
  },
};
