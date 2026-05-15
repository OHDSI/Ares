import { defineConfig } from "vite";
import "./logger";

import path from "path";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/ares/",
  appType: "mpa",
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  plugins: [vue()],
  server: {
    port: 8080,
    host: process.env.VITE_HOST ?? "localhost",
    proxy: {
      "/ares-api": `http://${process.env.VITE_HOST ?? "localhost"}:3000`,
      "/webapi": `http://${process.env.VITE_HOST ?? "localhost"}:4000/webapi`,
    },
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
  },
  build: {
    target: "esnext",
    sourcemap: false,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/echarts") ||
            id.includes("node_modules/zrender")
          ) {
            return "echarts";
          }
          if (id.includes("node_modules/@duckdb")) {
            return "duckdb";
          }
          if (
            id.includes("node_modules/codemirror") ||
            id.includes("node_modules/@codemirror")
          ) {
            return "codemirror";
          }
          if (
            id.includes("node_modules/primevue") ||
            id.includes("node_modules/primeicons")
          ) {
            return "primevue";
          }
          if (
            id.includes("node_modules/vue/") ||
            id.includes("node_modules/vue-router") ||
            id.includes("node_modules/vuex") ||
            id.includes("node_modules/lodash") ||
            id.includes("node_modules/axios")
          ) {
            return "vendor";
          }
        },
      },
    },
  },
});
