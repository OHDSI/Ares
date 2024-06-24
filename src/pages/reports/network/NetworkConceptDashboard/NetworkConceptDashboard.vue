<template>
  <Panel header="Network Concept Dashboard">
    <template #icons>
      <Button @click="renderForm">
        <span class="uppercase font-light text-white py-1 px-2"
          >Add concepts
        </span></Button
      >
    </template>
    <div class="table-container">
      <DataTable
        removable-sort
        rowGroupMode="subheader"
        groupRowsBy="CONCEPT_NAME"
        class="table"
        v-if="data.length"
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="data"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Source" field="CDM_NAME"></Column>
        <Column sortable header="Concept Name" field="CONCEPT_NAME"></Column>

        <Column sortable header="Concept ID" field="CONCEPT_ID"></Column>
        <Column
          sortable
          header="# People"
          field="PEOPLE_COUNT"
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
        >
          <template #body="slotProps">
            {{ helpers.formatComma(slotProps.data.PEOPLE_COUNT) }}
          </template>
        </Column>
        <Column
          sortable
          header="% People"
          field="PEOPLE_PERCENT"
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
        >
          <template #body="slotProps">
            {{ slotProps.data.PEOPLE_PERCENT }}%
          </template>
        </Column>
      </DataTable>
      <div v-else class="placeholder table-placeholder">
        Add at least one concept to display the results
      </div>
    </div>
  </Panel>
  <ConceptSearchForm
    :added-concepts="selectedConcept"
    @close="closeForm"
    :show="showWebApiSearchForm"
  />
</template>

<script setup lang="ts">
import "./index.css";
import {
  ConceptSearchForm,
  useConceptSearchForm,
} from "@/widgets/conceptSearchForm";

import { computed, ref } from "vue";
import { useStore } from "vuex";
import Panel from "primevue/panel";
import Button from "primevue/button";
import { helpers } from "@/shared/lib/mixins";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const store = useStore();
const selectedConcept = ref([]);
const data = computed(() => {
  return store.getters.getData?.concept || [];
});

const { closeForm, renderForm, showWebApiSearchForm } = useConceptSearchForm();
</script>

<style scoped>
.table {
  flex-grow: 1;
}

.table-card {
  padding: 10px;
  width: 100%;
  height: 100%;
}

.table-container {
  display: flex;
  flex-grow: 1;
  justify-content: center;
  padding: 10px;
  min-height: 60vh;
}

.placeholder {
  text-align: center;
  align-self: center;
}

.table-placeholder {
  font-size: 1.5rem !important;
}
</style>
