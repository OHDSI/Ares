<template>
  <div>
    <Panel
      header="WebAPI details"
      v-if="store.getters.getApiData.serviceDetails"
    >
      <div
        class="flex flex-col gap-10"
        v-if="store.getters.getApiData.serviceDetails"
      >
        <div
          v-for="(value, propertyName) in getApiMetadata()"
          :key="propertyName"
          class="pl-8"
        >
          {{ propertyName }}: {{ value }}
        </div>
      </div>
      <div v-else>
        <h3 class="text-xl">WebAPI server is unavailable at the time</h3>
      </div>
    </Panel>

    <Panel header="Sources" v-if="store.getters.getApiData.apiSources">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="store.getters.getApiData.apiSources"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column header="Source" field="sourceKey"> </Column>
        <Column header="Source Dialect" field="sourceDialect"></Column>
        <Column header="Source Name" field="sourceName"></Column>
        <Column field="sourceId" header="Source ID"> </Column>
      </DataTable>
    </Panel>
    <h1 v-else class="text-center text-black dark:text-white">
      No data available
    </h1>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import Panel from "primevue/panel";

import DataTable from "primevue/datatable";
import Column from "primevue/column";

const store = useStore();

const getApiMetadata = function () {
  const data = store.getters.getApiData.serviceDetails;
  return {
    "WebAPI version": data.version,
    Timestamp: data.buildInfo.timestamp,
    Branch: data.buildInfo.branch,
    "Commit ID": data.buildInfo.commitId,
  };
};
</script>

<script lang="ts">
export default {
  name: "WebApiInfo",
};
</script>

<style scoped></style>
