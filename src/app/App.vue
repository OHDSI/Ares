<template>
  <v-app>
    <v-container main fluid class="pt-4 pl-2 pr-2 mb-16 main">
      <router-view name="main" />
    </v-container>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
import { errorActions } from "@/widgets/error";
import { webApiActions } from "@/shared/api/webAPI";
export default {
  name: "ARES",
  computed: {
    ...mapGetters(["getSettings", "getSources"]),
    darkMode: function () {
      return this.getSettings.darkMode;
    },
    path: function () {
      return this.$route.path;
    },
  },
  watch: {
    darkMode() {
      this.$vuetify.theme.dark = this.getSettings.darkMode;
    },
    path() {
      this.$store.dispatch(errorActions.RESET_ERRORS);
      this.$store.dispatch(webApiActions.RESET_API_STORAGE);
    },
  },
  created() {
    this.$vuetify.theme.dark = this.getSettings.darkMode;
  },
};
</script>

<style scoped>
.main {
  width: 95%;
}
</style>
