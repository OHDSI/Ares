import "@mdi/font/css/materialdesignicons.css";
import "@/main.scss";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { createVuetify } from "vuetify";

import {
  purpleLight,
  purpleDark,
  blueLight,
  blueDark,
} from "@/app/plugins/themes";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    themes: {
      purpleLight,
      purpleDark,
      blueLight,
      blueDark,
    },
    variations: {
      colors: ["primary", "secondary"],
      lighten: 2,
      darken: 2,
    },
  },
});

export default vuetify;
