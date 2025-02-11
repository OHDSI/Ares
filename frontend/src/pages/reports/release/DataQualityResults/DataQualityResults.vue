<template>
  <Card>
    <template #content>
      <TabView
        @update:activeIndex="setCurrentTab"
        :active-index="getCurrentTab"
      >
        <TabPanel header="Overview">
          <OverviewTable />
        </TabPanel>
        <TabPanel header="Metadata">
          <MetadataTable />
        </TabPanel>
        <TabPanel header="Results">
          <ResultsTable />
        </TabPanel>
        <TabPanel header="Pivot Table">
          <PivotDataTable />
        </TabPanel>
      </TabView>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Card from "primevue/card";

import OverviewTable from "@/pages/reports/release/DataQualityResults/components/OverviewTable.vue";
import ResultsTable from "@/pages/reports/release/DataQualityResults/components/ResultsTable.vue";
import PivotDataTable from "@/pages/reports/release/DataQualityResults/components/PivotDataTable.vue";
import MetadataTable from "@/pages/reports/release/DataQualityResults/components/MetadataTable.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

const getCurrentTab = computed(() => {
  return parseInt(route.query.tab) || 0;
});

const setCurrentTab = function (val) {
  router.push({
    query: {
      tab: val,
    },
  });
};
</script>

<style>
tr:hover {
  background-color: transparent !important;
}
.CodeMirror {
  height: auto;
}
.v-data-table-header th {
  white-space: nowrap;
}

body {
  font-size: 14px;
}
a {
  text-decoration: none;
}
</style>
