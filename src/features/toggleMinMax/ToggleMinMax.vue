<template>
  <v-list-item>
    <v-list-item-action>
      <v-switch v-model="minMax"></v-switch>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>{{
        minMax ? "MIN/MAX" : "P10/P90"
      }}</v-list-item-title>
      <v-list-item-subtitle
        >Applicable to some reports. Determines whether to use Min/Max or
        P10/P90 values for chart rendering</v-list-item-subtitle
      >
    </v-list-item-content>
  </v-list-item>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ToggleMinMax",
  computed: {
    ...mapGetters(["getSettings"]),
    minMax: {
      get: function () {
        return this.getSettings.minMax;
      },
      set: function (value) {
        this.$store.commit("setMinMax", value);
      },
    },
  },
};
</script>

<style scoped></style>
