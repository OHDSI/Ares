<template>
  <div v-if="!store.getters.getErrors" class="flex flex-col gap-10">
    <PageHeader title="Domain Table" />
    <div class="flex flex-col gap-5">
      <MainTable />
      <DomainMetadataTable :data="store.getters.getData.metadataData" />
      <DataStratificationByVisit />
      <DataStratificationByDrug />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";

import MainTable from "@/pages/reports/release/DomainTable/components/MainTable.vue";
import DataStratificationByVisit from "@/pages/reports/release/DomainTable/components/DataStratificationByVisit/DataStratificationByVisit.vue";
import DataStratificationByDrug from "@/pages/reports/release/DomainTable/components/DataStratificationByDrug/DataStratificationByDrug.vue";
import DomainMetadataTable from "@/pages/reports/release/DomainTable/components/DomainMetadataTable.vue";
import PageHeader from "@/entities/pageHeader/PageHeader.vue";

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
