import axios from "axios/index";
const envUrl = "./env/env.json";
class Environment {
  load() {
    return new Promise(async (res) => {
      const response = await axios.get(envUrl);
      Object.assign(this, response.data);
      res();
    });
  }
}
const environment = new Environment();
export default environment;
