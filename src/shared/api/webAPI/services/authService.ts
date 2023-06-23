import apiService from "@/shared/api/apiService";
import environment from "@/shared/api/environment";

export const authService = {
  token: {
    get() {
      return apiService(
        {
          url: `${environment.WEB_API_URL}user/login/windows`,
          method: "get",
          baseURL: "/",
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
        {}
      );
    },
  },
  user: {
    get(token) {
      return apiService(
        {
          url: `${environment.WEB_API_URL}user/me`,
          baseURL: "/",
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
};
