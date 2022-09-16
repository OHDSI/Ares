<template>
  <v-list-item>
    <v-list-item-action>
      <v-switch v-model="darkMode"></v-switch>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>{{
        darkMode ? "Dark Mode" : "Light Mode"
      }}</v-list-item-title>
      <v-list-item-subtitle>Select the Color mode</v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ToggleDarkMode",
  computed: {
    ...mapGetters(["getSettings"]),
    darkMode: {
      get: function () {
        return this.getSettings.darkMode;
      },
      set: function (value) {
        this.$store.commit("setDarkMode", value);
      },
    },
  },
};
</script>

<style scoped></style>
