import apiService from "@/shared/api/axios/apiService";
import environment from "@/shared/api/environment";

export const authService = {
  token: {
    get() {
      //Test token
      // return new Promise((resolve, reject) => {
      //   resolve({
      //     headers: {
      //       bearer:
      //         "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MjE3MDUyNDcsImV4cCI6MTc1MzI0MTI0NywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.FU_myh_cHwNu8gob6Unp4itEY2cLGw_M_AZXiVSsSok",
      //     },
      //   });
      // });

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
    logout(token) {
      return apiService(
        {
          url: `${environment.WEB_API_URL}user/logout`,
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
  user: {
    get(token: string) {
      // return new Promise((resolve, reject) => {
      //   resolve({ data: { name: "Test" } });
      // });
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
