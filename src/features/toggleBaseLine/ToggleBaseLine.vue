<template>
  <v-list-item>
    <v-list-item-action>
      <v-switch v-model="zeroBaseLine"></v-switch>
    </v-list-item-action>
    <v-list-item-title>{{
      zeroBaseLine ? "Zero Baseline" : "Non-zero baseline"
    }}</v-list-item-title>
    <v-list-item-subtitle
      >Determines whether the axis starts from the 0 or the lowest value in the
      set</v-list-item-subtitle
    >
  </v-list-item>
</template>

<script lang="ts">
export default {
  name: "ToggleBaseLine",
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const zeroBaseLine = computed({
  get: function (): boolean {
    return store.getters.getSettings.zeroBaseline;
  },
  set: function (value: boolean): void {
    store.commit("setBaseline", value);
  },
});
</script>

<style scoped></style>
