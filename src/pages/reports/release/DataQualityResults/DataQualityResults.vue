<template>
  <v-responsive>
    <div v-if="!store.getters.getErrors">
      <v-card :loading="!store.getters.dataInStore" elevation="10" class="ma-4">
        <v-tabs v-model="tab">
          <v-tab value="overview">Overview</v-tab>
          <v-tab value="metadata">Metadata</v-tab>
          <v-tab value="results">Results</v-tab>
          <v-tab value="pivot">Pivot table</v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item v-if="store.getters.dataInStore" value="overview">
            <OverviewTable />
          </v-window-item>
          <v-window-item v-if="store.getters.dataInStore" value="metadata">
            <MetadataTable />
          </v-window-item>
          <v-window-item v-if="store.getters.dataInStore" value="results">
            <ResultsTable />
          </v-window-item>
          <v-window-item v-if="store.getters.dataInStore" value="pivot">
            <PivotDataTable />
          </v-window-item>
        </v-window>
      </v-card>
    </div>
  </v-responsive>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";

import OverviewTable from "@/pages/reports/release/DataQualityResults/components/OverviewTable.vue";
import ResultsTable from "@/pages/reports/release/DataQualityResults/components/ResultsTable.vue";
import PivotDataTable from "@/pages/reports/release/DataQualityResults/components/PivotDataTable.vue";
import MetadataTable from "@/pages/reports/release/DataQualityResults/components/MetadataTable.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

const tab = computed({
  set(tab: string): void {
    router.push({
      query: {
        tab: tab,
      },
    });
  },
  get(): string | string[] {
    return route.query.tab;
  },
});
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
.v-text-field {
  padding-top: 0px !important;
}
table#results {
  width: 100%;
}
table#results tr td.header {
  text-transform: uppercase;
  background-color: rgb(var(--v-theme-accent));
}
table#results .subheader {
  text-transform: uppercase;
  background-color: rgb(var(--v-theme-accent));
}
table#results {
  border-spacing: 2px;
}
table#results td {
  font-size: 14px;
  line-height: 30px;
  text-align: right;
}
table#results th {
  text-align: left;
}
table#results tbody td {
  padding: 0px 3px 0px 7px;
}
body {
  font-size: 14px;
}
a {
  text-decoration: none;
}
</style>
