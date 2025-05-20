<template>
  <div v-if="!store.getters.getErrors" class="flex flex-col gap-5">
    <CostTimeSeries />
    <CostDomains />
    <MainTable />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";

import MainTable from "./components/MainTable.vue";
import CostTimeSeries from "@/pages/reports/release/CostTable/components/costTimeSeries/CostTimeSeries.vue";
import { ref, watch } from "vue";

import { useRoute, useRouter } from "vue-router";
import CostDomains from "@/pages/reports/release/CostTable/components/costDomains/CostDomains.vue";

const store = useStore();

const route = useRoute();
const router = useRouter();

const visible = ref(false);

watch(visible, () => {
  if (visible.value === false)
    if (route.params.concept) {
      router.replace({ name: route.name });
    }
});
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
