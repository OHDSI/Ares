<template>
  <v-list-item>
    <v-list-item-action>
      <v-switch v-model="zeroBaseline"></v-switch>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>{{
        zeroBaseline ? "Zero Baseline" : "Non-zero baseline"
      }}</v-list-item-title>
      <v-list-item-subtitle
        >Determines whether the axis starts from the 0 or the lowest value in
        the set</v-list-item-subtitle
      >
    </v-list-item-content>
  </v-list-item>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ToggleBaseLine",
  computed: {
    ...mapGetters(["getSettings"]),
    zeroBaseline: {
      get: function () {
        return this.getSettings.zeroBaseline;
      },
      set: function (value) {
        this.$store.commit("setBaseline", value);
      },
    },
  },
};
</script>

<style scoped></style>
