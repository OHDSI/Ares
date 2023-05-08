<template>
  <v-responsive min-width="900">
    <DomainRecords />
  </v-responsive>
</template>

<script setup lang="ts">
import DomainRecords from "@/pages/reports/source/DomainContinuity/charts/domainRecords/DomainRecords.vue";
</script>

<style scoped>
.viz-container {
  width: 80%;
}
</style>
