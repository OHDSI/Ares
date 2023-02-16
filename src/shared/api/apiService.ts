import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const loadFile = (config: AxiosRequestConfig, payload: object) => {
  const instance = axios.create({ baseURL: "/ares" });
  instance.interceptors.response.use(
    function (response: AxiosResponse) {
      return response;
    },
    function (error: AxiosError) {
      return Promise.reject({ error, payload });
    }
  );

  return instance.request(config).then((response) => {
    return { data: response.data, payload };
  });
};

export default loadFile;
