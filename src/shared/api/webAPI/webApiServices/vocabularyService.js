import environment from "@/shared/api/environment";
import apiService from "@/shared/api/apiService";

export const VocabularyService = {
  search: {
    get(query, source, token) {
      return apiService({
        url: `${environment.WEB_API_URL}/vocabulary/${source}/search/${query}`,
        baseURL: "./",
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
};
