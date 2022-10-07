<template>
  <v-bottom-navigation fixed dark dense>
    <v-layout justify-end>
      <v-btn to="/help">
        <v-icon dark>mdi-help-circle-outline</v-icon>
      </v-btn>
      <v-btn to="/network/overview">
        <v-icon dark>mdi-database</v-icon>
      </v-btn>
      <v-btn to="/">
        <v-img
          :src="require('@/shared/assets/icon.png')"
          max-height="20"
          max-width="20"
        ></v-img>
      </v-btn>
      <v-btn @click="toggleSettings">
        <v-icon dark>mdi-cog-outline</v-icon>
      </v-btn>
    </v-layout>
  </v-bottom-navigation>
</template>

<script>
import { SET_VISIBILITY } from "@/widgets/settings/model/store/mutations.type";

export default {
  name: "BottomNav",
  methods: {
    toggleSettings: function () {
      this.$store.commit(SET_VISIBILITY, !this.$store.getters.getVisibility);
    },
  },
};
</script>

<style scoped></style>
