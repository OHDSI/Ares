<template>
  <div v-if="!store.getters.getErrors" class="flex flex-col gap-5">
    <MainTable />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";

import MainTable from "./components/CohortsIndex.vue";

const store = useStore();
</script>

<style scoped>
td {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.viz-container {
  width: 90%;
}
</style>
