<template>
  <div
    class="flex flex-col bg-surface-0 dark:bg-surface-800 dark:text-white justify-center items-center gap-5 shadow-md my-6 p-20"
  >
    <h1 class="text-2xl">A R E S</h1>
    <img :class="iconClass" :src="logo" height="64" width="64" />
    <p class="text-lg font-light">
      <b>A</b> <b>R</b>esearch <b>E</b>xploration <b>S</b>ystem that facilitates
      exploration of patient level, observational data research accompanied by
      source data characterization and quality assessment ensuring that results
      are presented with proper context.
    </p>
    <div class="flex flex-row gap-10">
      <Button link @click="redirectToHome">
        <svg-icon
          class="text-primary-500"
          type="mdi"
          :path="mdiDatabase"
        ></svg-icon>
        <!--      Maybe renaming is in order? Explore data sources feels strange when compared to "strategus"-->
        <span class="text-primary-500 uppercase">Explore Data Sources</span>
      </Button>
      <Button v-if="characterizationEnabled" link @click="redirectToStrategus">
        <svg-icon
          class="text-primary-500"
          type="mdi"
          :path="mdiDatabase"
        ></svg-icon>
        <span class="text-primary-500 uppercase">Explore Characterization</span>
      </Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useStore } from "vuex";
import { computed } from "vue";
import logo from "@/shared/assets/icon.png";
import environment from "@/shared/api/environment";

import Button from "primevue/button";
import { useRouter } from "vue-router";

import { mdiDatabase } from "@mdi/js";
import SvgIcon from "@jamescoyle/vue-icon";

const store = useStore();
const router = useRouter();

const iconClass = computed((): string => {
  return store.getters.getSettings.darkMode ? "" : "inverted";
});

const characterizationEnabled = environment.CHARACTERIZATION;

function redirectToHome() {
  router.push("/network/overview");
}

function redirectToStrategus() {
  router.push("/characterization");
}
</script>

<style scoped>
.inverted {
  filter: invert(1);
}
.introduction {
  line-height: 2;
  font-size: 16px;
}
</style>
