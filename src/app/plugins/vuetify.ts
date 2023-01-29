import "@mdi/font/css/materialdesignicons.css";
import "@/main.scss";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { createVuetify } from "vuetify";

import { light, dark } from "@/app/plugins/themes";
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
      light,
      dark,
    },
  },
});

export default vuetify;
