<template>
  <v-app>
    <!--
    <div class="mb-2">
      <v-app-bar class="d-flex justify-center" v-if="!isElectron" dense dark>
        <v-img
          @click="goHome()"
          :src="require('./assets/icon.png')"
          max-height="32"
          max-width="32"
        ></v-img>
        <v-spacer></v-spacer>
      </v-app-bar>
    </div>
    -->
    <v-container class="pt-4 pl-2 pr-2 mb-16">
      <router-view name="main"></router-view>
    </v-container>
    <v-bottom-navigation fixed dark dense>
      <v-layout justify-end>
        <v-btn to="/help">
          <v-icon dark>mdi-help-circle-outline</v-icon>
        </v-btn>
        <v-btn to="/network/overview"
          ><v-icon dark>mdi-database</v-icon></v-btn
        >
        <v-btn to="/"
          ><v-img
            :src="require('./assets/icon.png')"
            max-height="20"
            max-width="20"
          ></v-img
        ></v-btn>
      </v-layout>
    </v-bottom-navigation>
  </v-app>
</template>

<script>
import isElectron from "is-electron";

export default {
  data() {
    return {
      dialog: false,
      isElectron: isElectron(),
    };
  },
  name: "ARES",
};
</script>

<style scoped>
</style>
