<template>
  <Button size="block" severity="secondary" @click="exportFiles">
    Export Notes
  </Button>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import Button from "primevue/button";
import { EXPORT_NOTES } from "@/widgets/notesPanel/model/store/actions.type";

const store = useStore();

function exportFiles() {
  store.dispatch(EXPORT_NOTES);
}
</script>

<style scoped></style>
