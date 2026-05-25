import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import globals from "globals";

const sharedRules = {
  eqeqeq: "warn",
  "no-shadow": "warn",
  "no-var": "warn",
  "prefer-const": "warn",
  "no-console": "warn",
};

export default [
  { ignores: ["node_modules", "logs"] },
  ...tseslint.config({
    files: ["**/*.ts"],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
    plugins: { prettier: prettierPlugin.plugins.prettier },
    rules: {
      ...prettierPlugin.rules,
      ...sharedRules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  }),
];
