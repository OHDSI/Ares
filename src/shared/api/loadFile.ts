import axios, { AxiosError, AxiosResponse } from "axios";

const loadFile = (path: string, payload: object) => {
  const instance = axios.create({ baseURL: "/ares" });
  instance.interceptors.response.use(
    function (response: AxiosResponse) {
      return response;
    },
    function (error: AxiosError) {
      return Promise.reject({ error, payload });
    }
  );

  return instance
    .get(path, {
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      },
    })
    .then((response) => {
      return { data: response.data, payload };
    });
};

export default loadFile;
