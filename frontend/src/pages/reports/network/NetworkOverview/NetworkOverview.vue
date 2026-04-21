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
import DataNetworkOverview from "@/pages/reports/network/NetworkOverview/components/dataNetworkOverview";
import DataSourcesList from "@/pages/reports/network/NetworkOverview/components/dataSourcesList";
const store = useStore();
</script>

<style scoped></style>
