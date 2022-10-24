<template>
  <v-snackbar v-model="showSnackbar" color="red accent-3" elevation="24">
    {{ getAlert.message }}: {{ getAlert.status }}
  </v-snackbar>
</template>

<script>
import { mapGetters } from "vuex";
import { RESET_ALERTS } from "@/widgets/snackbar/model/store/actions.type";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Snackbar",
  computed: {
    ...mapGetters(["getAlert", "getAlertVisibility"]),
    showSnackbar: {
      get() {
        return this.getAlertVisibility;
      },
      set() {
        this.$store.dispatch(RESET_ALERTS);
      },
    },
  },
};
</script>

<style scoped></style>
