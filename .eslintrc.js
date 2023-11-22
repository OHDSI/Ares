module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    eqeqeq: "warn",
    "vue/eqeqeq": "warn",
    "no-shadow": "warn",
    "no-var": "warn",
    "prefer-const": "warn",
    "no-console": "warn",
  },
};
