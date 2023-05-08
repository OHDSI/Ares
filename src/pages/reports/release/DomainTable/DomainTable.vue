<template>
  <div v-if="!store.getters.getErrors">
    <v-container fluid class="pa-1">
      <MainTable />
      <DataStratificationByVisit />
      <DataStratificationByDrug />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";

import MainTable from "@/pages/reports/release/DomainTable/components/MainTable.vue";
import DataStratificationByVisit from "@/pages/reports/release/DomainTable/components/DataStratificationByVisit/DataStratificationByVisit.vue";
import DataStratificationByDrug from "@/pages/reports/release/DomainTable/components/DataStratificationByDrug/DataStratificationByDrug.vue";

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
