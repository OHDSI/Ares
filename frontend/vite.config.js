import { defineConfig } from "vite";
import "./logger";

import path from "path";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  base: "/ares/",
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  plugins: [vue(), vueJsx({})],
  server: {
    port: 8080,
    proxy: {
      "/ares-api": "http://localhost:3000",
      "/webapi": "http://localhost:3000/webapi",
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
    chunkSizeWarningLimit: 600,
    cssCodeSplit: false,
    target: "esnext",
    sourcemap: true,
  },
});
