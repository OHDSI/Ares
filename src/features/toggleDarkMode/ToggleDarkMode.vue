<template>
  <v-list-item>
    <v-list-item-action>
      <v-switch v-model="darkMode"></v-switch>
    </v-list-item-action>
    <v-list-item-title>{{
      darkMode ? "Dark Mode" : "Light Mode"
    }}</v-list-item-title>
    <v-list-item-subtitle>Select the Color mode</v-list-item-subtitle>
  </v-list-item>
</template>

<script lang="ts">
export default {
  name: "ToggleDarkMode",
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const darkMode = computed({
  get: function (): boolean {
    return store.getters.getSettings.darkMode;
  },
  set: function (value: boolean): void {
    store.commit("setDarkMode", value);
  },
});
</script>

<style scoped></style>
