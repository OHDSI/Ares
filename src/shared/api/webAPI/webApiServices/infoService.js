import apiService from "@/shared/api/apiService";
import environment from "@/shared/api/environment";

export const InfoService = {
  sources: {
    get(token) {
      return apiService(
        {
          url: `${environment.WEB_API_URL}/source/sources`,
          method: "get",
          baseURL: "/",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        {}
      );
    },
  },
  webApi: {
    get(token) {
      return apiService(
        {
          url: `${environment.WEB_API_URL}/info`,
          method: "get",
          baseURL: "/",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        {}
      );
    },
  },
};
