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
      this.WEB_API_ENABLED = this.WEB_API_ENABLED === "true";
      this.DUCKDB_ENABLED = this.DUCKDB_ENABLED === "true";
    });
  }
}
const environment = new Environment();
export default environment;
