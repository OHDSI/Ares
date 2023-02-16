import environment from "@/shared/api/environment";
import apiService from "@/shared/api/apiService";

export const VocabularyService = {
  search: {
    get(query, source, token) {
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
            STANDARD_CONCEPT: "S",
            QUERY: query,
          },
        },
        {}
      );
    },
  },
};
