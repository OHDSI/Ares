import axios from "axios";
import store from "../store";
import { NEW_ERROR } from "@/data/store/modules/errors/actions.type";

const loadFile = (path, payload) => {
  const instance = axios.create();
  instance.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      if (payload.required) {
        store.dispatch(NEW_ERROR, {
          message: error,
          details: error.config.url,
        });
      }
    }
  );
  return new Promise((resolve, reject) => {
    instance
      .get(path)
      .then((response) => resolve({ response, payload }))
      .catch((error) => reject({ error, payload }));
  });
};

export default loadFile;
