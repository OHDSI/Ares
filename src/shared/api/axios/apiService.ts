import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import environment from "@/shared/api/environment";

const loadFile = (config: AxiosRequestConfig, payload: object) => {
  const instance = axios.create();
  instance.interceptors.response.use(
    function (response: AxiosResponse) {
      return response;
    },
    function (error: AxiosError) {
      return Promise.reject({ ...error, payload });
    }
  );

  return instance.request(config).then((response) => {
    return { data: response.data, headers: response.headers, payload };
  });
};

export default loadFile;
