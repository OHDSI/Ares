<template>
  <v-bottom-navigation density="comfortable">
    <v-layout class="justify-end align-center">
      <v-btn to="/help">
        <v-icon>mdi-help-circle-outline</v-icon>
      </v-btn>
      <v-btn to="/network/overview">
        <v-icon>mdi-database</v-icon>
      </v-btn>
      <v-btn to="/">
        <v-img :class="iconClass" :src="logo" width="20"></v-img>
      </v-btn>
      <v-btn @click="toggleSettings">
        <v-icon dark>mdi-cog-outline</v-icon>
      </v-btn>
    </v-layout>
  </v-bottom-navigation>
</template>

<script lang="ts">
export default {
  name: "BottomNav",
};
</script>

<script setup lang="ts">
import { SET_VISIBILITY } from "@/widgets/settings/model/store/mutations.type";
import logo from "@/shared/assets/icon.png";
import { useStore } from "vuex";
import { computed } from "vue";

const store = useStore();

const iconClass = computed((): string => {
  return store.getters.getSettings.darkMode ? "" : "inverted";
});

const toggleSettings = function (): void {
  store.commit(SET_VISIBILITY, !store.getters.getVisibility);
};
</script>

<style scoped>
.inverted {
  filter: invert(1);
}
</style>
