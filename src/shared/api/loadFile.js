import axios from "axios";

const loadFile = (path, payload) => {
  const instance = axios.create();
  instance.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      return error;
    }
  );
  return new Promise((resolve, reject) => {
    instance
      .get(path)
      .then((response) => {
        resolve({ response, payload });
      })
      .catch((error) => reject({ error, payload }));
  });
};

export default loadFile;
