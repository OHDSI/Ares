<template>
  <v-row justify="center">
    <v-navigation-drawer v-model="showMenu" width="30%" fixed temporary right>
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="showMenu = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Settings</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-list three-line subheader>
          <v-subheader>Charts</v-subheader>
          <v-list-item>
            <v-list-item-action>
              <v-switch v-model="zeroBaseline"></v-switch>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{
                zeroBaseline ? "Zero Baseline" : "Non-zero baseline"
              }}</v-list-item-title>
              <v-list-item-subtitle
                >Determines whether the axis starts from the 0 or the lowest
                value in the set</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-action>
              <v-switch v-model="minMax"></v-switch>
              <!--
              <v-checkbox v-model="minMax"></v-checkbox>
-->
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{
                minMax ? "MIN/MAX" : "P10/P90"
              }}</v-list-item-title>
              <v-list-item-subtitle
                >Applicable to some reports. Determines whether to use Min/Max
                or P10/P90 values for chart rendering</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list three-line subheader>
          <v-subheader>General</v-subheader>
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
        </v-list>
      </v-card>
    </v-navigation-drawer>
  </v-row>
</template>

<script>
import { mapGetters } from "vuex";
import { SET_VISIBILITY } from "@/data/store/modules/settings/mutations.type";

export default {
  name: "Settings",
  props: {
    show: { type: Boolean, default: false },
  },
  data() {
    return {
      notifications: false,
      sound: true,
      widgets: false,
    };
  },
  computed: {
    ...mapGetters(["getSettings", "getVisibility"]),
    darkMode: {
      get: function () {
        return this.getSettings.darkMode;
      },
      set: function (value) {
        this.$store.commit("setDarkMode", value);
      },
    },
    zeroBaseline: {
      get: function () {
        return this.getSettings.zeroBaseline;
      },
      set: function (value) {
        this.$store.commit("setBaseline", value);
      },
    },
    minMax: {
      get: function () {
        return this.getSettings.minMax;
      },
      set: function (value) {
        this.$store.commit("setMinMax", value);
      },
    },
    showMenu: {
      get: function () {
        return this.getVisibility;
      },
      set: function (value) {
        this.$store.commit(SET_VISIBILITY, value);
      },
    },
  },
};
</script>

<style scoped></style>
