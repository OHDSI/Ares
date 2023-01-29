import { ThemeDefinition } from "vuetify";

const light: ThemeDefinition = {
  dark: false,
  colors: {
    accent: "#E0E0E0",
    message: "#4b4d59",
  },
};

const dark: ThemeDefinition = {
  dark: true,
  colors: {
    accent: "#424242",
    message: "#41434DFF",
  },
};

export { light, dark };
