import { ThemeDefinition } from "vuetify";

const purpleLight: ThemeDefinition = {
  dark: false,
  colors: {
    accent: "#E0E0E0",
    message: "#4b4d59",
  },
};

const purpleDark: ThemeDefinition = {
  dark: true,
  colors: {
    accent: "#424242",
    message: "#41434DFF",
  },
};
const blueLight: ThemeDefinition = {
  dark: false,
  colors: {
    primary: "#1976D2",
    secondary: "#424242",
    accent: "#E0E0E0",
    error: "#FF5252",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FFC107",
    message: "#4b4d59",
  },
};

const blueDark: ThemeDefinition = {
  dark: true,
  colors: {
    primary: "#2196F3",
    secondary: "#424242",
    accent: "#424242",
    error: "#FF5252",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
    message: "#41434DFF",
  },
};

export { purpleLight, purpleDark, blueLight, blueDark };
