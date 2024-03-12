<template>
  <Toast></Toast>
</template>

<script setup lang="ts">
import { RESET_ALERTS } from "@/widgets/snackbar/model/store/actions.type";
import { useStore } from "vuex";

import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import { watch } from "vue";

const toast = useToast();

const store = useStore();

watch(store.getters.getAlertVisibility, () => {
  if (store.getters.getAlertVisibility) {
    toast.add({
      severity: "error",
      summary: store.getters.getAlert.status,
      detail: store.getters.getAlert.message,
      life: 3000,
    });
    store.dispatch(RESET_ALERTS);
  }
});
</script>

<style scoped></style>
