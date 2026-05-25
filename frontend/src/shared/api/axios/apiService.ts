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
    },
  );

  return instance.request(config).then((response) => {
    const body = response.data as { data?: unknown; meta?: unknown } | null;
    const data = body?.data !== undefined ? body.data : response.data;
    const meta = body?.meta;
    return { data, meta, headers: response.headers, payload };
  });
};

export default loadFile;
