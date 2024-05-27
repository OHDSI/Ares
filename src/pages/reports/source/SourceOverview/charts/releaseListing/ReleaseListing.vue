<template>
  <Panel header="Release listing">
    <DataTable
      size="small"
      showGridlines
      :value="getTable"
      paginator
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      :rows="5"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      tableStyle="min-width: 50rem"
      removable-sort
    >
      <Column sortable field="release_name" header="Release Date"> </Column>
      <Column
        :pt="{ headerContent: 'justify-end' }"
        sortable
        field="count_person"
        header="Count person"
      >
        <template #body="slotProps">
          <div class="flex flex-row justify-end">
            <router-link
              class="text-blue-400 hover:underline"
              :to="getPersonLink(slotProps.data)"
              :title="slotProps.data.count_person"
              >{{
                helpers.formatComma(slotProps.data.count_person)
              }}</router-link
            >
          </div>
        </template>
      </Column>
      <Column
        :pt="{ headerContent: 'justify-end' }"
        sortable
        field="count_data_quality_issues"
        header="Data quality issues"
      >
        <template #body="slotProps">
          <div class="flex flex-row justify-end">
            <router-link
              class="text-blue-400 hover:underline"
              :to="getQualityLink(slotProps.data)"
              >{{
                helpers.formatComma(slotProps.data.count_data_quality_issues)
              }}</router-link
            >
          </div>
        </template>
      </Column>
    </DataTable>
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import { helpers } from "@/shared/lib/mixins";
import { computed, ref } from "vue";
import { useStore } from "vuex";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const store = useStore();

const getTable = computed(function () {
  if (store.getters.explorerLoaded) {
    return store.getters.getSelectedSource.releases;
  } else {
    return [];
  }
});

const getQualityLink = function (item) {
  return {
    name: "dataQuality",
    params: {
      cdm: store.getters.getSelectedSource.cdm_source_key,
      release: item.release_id,
    },
    query: { tab: "overview" },
  };
};
const getPersonLink = function (item) {
  return {
    name: "person",
    params: {
      cdm: store.getters.getSelectedSource.cdm_source_key,
      release: item.release_id,
    },
  };
};
</script>

<style scoped></style>
