import { defineConfig } from "vite";

import path from "path";
import vuetify from "vite-plugin-vuetify";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  plugins: [vue(), vueJsx({}), vuetify({ autoImport: true })],
  server: {
    port: 8080,
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
  },
});
