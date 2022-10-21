import apiService from "@/shared/api/apiService";
import environment from "@/shared/api/environment";

export const InfoService = {
  sources: {
    get() {
      return apiService(
        {
          url: `${environment.WEB_API_URL}/source/sources`,
          method: "get",
          baseURL: "/",
          headers: {
            "Content-Type": "application/json",
          },
        },
        {}
      );
    },
  },
  webApi: {
    get() {
      return apiService(
        {
          url: `${environment.WEB_API_URL}/info`,
          method: "get",
          baseURL: "/",
          headers: {
            "Content-Type": "application/json",
          },
        },
        {}
      );
    },
  },
};
