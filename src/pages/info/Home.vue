<template>
  <v-card elevation="10" class="ma-5 pa-7">
    <v-layout class="ma-4 justify-center">
      <h2>A R E S</h2>
    </v-layout>
    <v-layout class="justify-center">
      <v-img
        :class="iconClass"
        :src="logo"
        max-height="64"
        max-width="64"
      ></v-img>
    </v-layout>
    <div class="ma-4 introduction">
      <b>A</b> <b>R</b>esearch <b>E</b>xploration <b>S</b>ystem that facilitates
      exploration of patient level, observational data research accompanied by
      source data characterization and quality assessment ensuring that results
      are presented with proper context.
    </div>
    <v-card-actions>
      <v-layout class="justify-center">
        <v-btn class="ma-2" color="primary" to="/network/overview">
          <v-icon left>mdi-database</v-icon>Explore Data Sources
        </v-btn>
      </v-layout>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
export default {
  name: "Home",
};
</script>
<script setup lang="ts">
import { useStore } from "vuex";
import { computed } from "vue";
import logo from "@/shared/assets/icon.png";

const store = useStore();

const iconClass = computed((): string => {
  return store.getters.getSettings.darkMode ? "" : "inverted";
});
</script>

<style scoped>
.v-card__text {
  line-height: 28px;
}
.inverted {
  filter: invert(1);
}
.introduction {
  line-height: 2;
  font-size: 16px;
}
</style>
