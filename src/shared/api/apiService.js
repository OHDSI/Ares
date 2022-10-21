import axios from "axios";

const apiService = (config, payload) => {
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
      .request(config)
      .then((response) => {
        resolve({ response, payload });
      })
      .catch((error) => reject({ error, payload }));
  });
};

export default apiService;
