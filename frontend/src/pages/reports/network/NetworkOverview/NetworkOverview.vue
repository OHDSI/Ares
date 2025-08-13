<template>
  <div
    v-if="store.getters.explorerLoaded"
    id="network-data-quality-overview"
    class="flex flex-col gap-10"
  >
    <DataNetworkOverview />
    <DataSourcesList />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import DataNetworkOverview from "@/pages/reports/network/NetworkOverview/components/DataNetworkOverview.vue";
import DataSourcesList from "@/pages/reports/network/NetworkOverview/components/DataSourcesList.vue";
const store = useStore();
</script>

<style scoped></style>
