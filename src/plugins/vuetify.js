import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import "@mdi/font/css/materialdesignicons.css";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: { customProperties: true },

    themes: {
      light: {
        accent: "#E0E0E0",
      },
      dark: {
        accent: "#424242",
      },
    },
  },
});
