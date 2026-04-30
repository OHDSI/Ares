<template>
  <div class="dqr-viewer">
    <div class="pill-nav-row">
      <PillNav
        :tabs="tabs"
        :modelValue="activeTab"
        @update:modelValue="setTab"
      />
    </div>

    <Transition name="tab-fade" mode="out-in">
      <div :key="activeTab" :class="activeTab !== 3 ? 'section' : ''">
        <component :is="tabs[activeTab].component" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, markRaw } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";

import PillNav from "@/shared/ui/pillNav";
import OverviewTable from "@/pages/reports/release/DataQualityResults/components/overviewTable";
import ResultsTable from "@/pages/reports/release/DataQualityResults/components/resultsTable";
import PivotDataTable from "@/pages/reports/release/DataQualityResults/components/pivotDataTable";
import MetadataTable from "@/pages/reports/release/DataQualityResults/components/metadataTable";

const store = useStore();
const route = useRoute();
const router = useRouter();

const tabs = [
  { key: "overview", label: "Overview", component: markRaw(OverviewTable) },
  { key: "metadata", label: "Metadata", component: markRaw(MetadataTable) },
  { key: "results", label: "Results", component: markRaw(ResultsTable) },
  { key: "pivot", label: "Pivot Table", component: markRaw(PivotDataTable) },
];

const activeTab = ref(parseInt(route.query.tab as string) || 0);

watch(
  () => route.query.tab,
  (val) => {
    activeTab.value = parseInt(val as string) || 0;
  }
);

function setTab(index: number) {
  activeTab.value = index;
  router.push({ query: { tab: index } });
}
</script>

<style scoped>
.dqr-viewer {
  width: 100%;
}

.pill-nav-row {
  margin-bottom: 0.75rem;
}

.section {
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  color: var(--color-text);
}

.tab-fade-leave-active {
  transition: opacity 0.1s ease;
}

.tab-fade-enter-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}

.tab-fade-enter-from {
  transform: translateY(4px);
}
</style>
