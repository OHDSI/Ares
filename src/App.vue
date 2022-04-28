<template>
  <v-app>
    <v-container fluid class="pt-4 pl-2 pr-2 mb-16 main">
      <router-view name="main"></router-view>
    </v-container>
    <Settings />
    <v-bottom-navigation fixed dark dense>
      <v-layout justify-end>
        <v-btn to="/help">
          <v-icon dark>mdi-help-circle-outline</v-icon>
        </v-btn>
        <v-btn to="/network/overview"><v-icon dark>mdi-database</v-icon></v-btn>
        <v-btn to="/"
          ><v-img
            :src="require('./assets/icon.png')"
            max-height="20"
            max-width="20"
          ></v-img
        ></v-btn>
        <v-btn @click="toggleSettings"
          ><v-icon dark>mdi-cog-outline</v-icon></v-btn
        >
      </v-layout>
    </v-bottom-navigation>
  </v-app>
</template>

<script>
import { RESET_ERRORS } from "@/data/store/modules/errors/actions.type";
import Settings from "@/interface/components/Settings";
import { mapGetters } from "vuex";
import { SET_VISIBILITY } from "@/data/store/modules/settings/mutations.type";

export default {
  name: "ARES",
  components: { Settings },
  data() {
    return {
      dialog: false,
    };
  },
  watch: {
    $route() {
      this.$store.dispatch(RESET_ERRORS);
    },
    darkMode() {
      this.$vuetify.theme.dark = this.getSettings.darkMode;
    },
  },
  created() {
    this.$vuetify.theme.dark = this.getSettings.darkMode;
  },
  methods: {
    toggleSettings: function () {
      this.$store.commit(SET_VISIBILITY, !this.$store.getters.getVisibility);
    },
  },
  computed: {
    ...mapGetters(["getSettings"]),
    darkMode: function () {
      return this.getSettings.darkMode;
    },
  },
};
</script>

<style scoped></style>
