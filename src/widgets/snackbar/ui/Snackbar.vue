<template>
  <v-snackbar v-model="showSnackbar" color="red accent-3" elevation="24">
    {{ store.getters.getAlert.message }}: {{ store.getters.getAlert.status }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { RESET_ALERTS } from "@/widgets/snackbar/model/store/actions.type";
import { useStore } from "vuex";

import { computed } from "vue";

const showSnackbar = computed({
  get() {
    return store.getters.getAlertVisibility;
  },
  set() {
    store.dispatch(RESET_ALERTS);
  },
});

const store = useStore();
</script>

<script lang="ts">
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Snackbar",
};
</script>

<style scoped></style>
