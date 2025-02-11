<template>
  <div class="flex flex-col gap-5" v-if="!store.getters.getErrors">
    <SourceDetails />
    <Metadata />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import SourceDetails from "@/pages/reports/release/MetadataReport/tables/SourceDetails.vue";
import Metadata from "@/pages/reports/release/MetadataReport/tables/Metadata.vue";

const store = useStore();
</script>

<style scoped>
td {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
