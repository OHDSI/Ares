import eslint from "@eslint/js";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default [
  { ignores: ["node_modules", "logs"] },
  {
    ...prettierPlugin,
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      ...prettierPlugin.rules,
      eqeqeq: "warn",
      "no-shadow": "warn",
      "no-var": "warn",
      "prefer-const": "warn",
      "no-console": "warn",
    },
  },
];
