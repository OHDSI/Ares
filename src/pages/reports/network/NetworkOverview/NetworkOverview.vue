<template>
  <div
    v-if="store.getters.explorerLoaded"
    id="network-data-quality-overview"
    class="pa-4"
  >
    <v-row>
      <v-col>
        <DataNetworkOverview />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <DataSourcesList />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import DataNetworkOverview from "@/pages/reports/network/NetworkOverview/components/DataNetworkOverview.vue";
import DataSourcesList from "@/pages/reports/network/NetworkOverview/components/DataSourcesList.vue";
const store = useStore();
</script>

<script lang="ts">
export default {
  name: "NetworkOverview",
};
</script>

<style scoped>
.v-card__title {
  word-break: normal;
}
.v-card__subtitle {
  padding-bottom: 0px;
  padding-top: 4px;
}
.row {
  margin-top: -5px;
}
</style>
