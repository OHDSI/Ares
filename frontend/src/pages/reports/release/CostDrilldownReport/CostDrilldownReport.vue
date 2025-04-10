<template>
  <div class="flex flex-col gap-10">
    <PageHeader :title="conceptName || 'Report name unknown'">
      <template #action>
        <div class="flex flex-row gap-2">
          <ReturnButton />
        </div>
      </template>
    </PageHeader>
    <CostIdTable :data="costDrilldownTable" />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import PageHeader from "@/entities/pageHeader/PageHeader.vue";
import { computed } from "vue";
import ReturnButton from "@/features/returnToPreviousPage";
import CostIdTable from "@/pages/reports/release/CostDrilldownReport/components/CostIdTable.vue";

const store = useStore();
const costDrilldownTable = computed(() => {
  return (
    store.getters.getData.costDrilldownTable.TOTAL_CONCEPT_COST_PER_COST_ID ||
    []
  );
});

const conceptName = computed(() => {
  return store.getters.getData.conceptName || "unknown";
});
</script>

<style scoped></style>
