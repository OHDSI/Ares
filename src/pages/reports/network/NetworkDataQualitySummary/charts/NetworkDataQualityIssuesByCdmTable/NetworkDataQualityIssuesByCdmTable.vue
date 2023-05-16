<template>
  <v-card :loading="!store.getters.getData" elevation="10" class="ma-4 pa-2">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-table"
      title="Network Data Quality Issues by CDM Table"
      :data="store.getters.getData[NETWORK_QUALITY_SUMMARY]"
      :config="specIssueStratificationByTable"
    />
  </v-card>
</template>

<script setup lang="ts">
import { NETWORK_QUALITY_SUMMARY } from "@/shared/config/files";
import { Chart } from "@/widgets/chart";
import { specIssueStratificationByTable } from "./specIssueStratificationByTable";
import { useStore } from "vuex";
const store = useStore();
</script>

<style scoped></style>
