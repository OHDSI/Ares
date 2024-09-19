import axios, { AxiosResponse } from "axios";
const envUrl = "./env/env.json";

class Environment {
  WEB_API_URL = null;
  WEB_API_ENABLED = null;
  DUCKDB_ENABLED = null;
  load() {
    const promise: Promise<AxiosResponse> = axios.get(envUrl);
    return promise.then((res) => {
      Object.assign(this, res.data);
    });
  }
}
const environment = new Environment();
export default environment;
