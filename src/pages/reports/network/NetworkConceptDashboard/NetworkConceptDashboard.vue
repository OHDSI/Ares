<template>
  <Panel header="Network Concept Dashboard">
    <template #icons>
      <Button @click="atClick">
        <span class="uppercase font-light text-white py-1 px-2"
          >Add concepts
        </span></Button
      >
    </template>
    <div class="table-container items-center">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
        removable-sort
        rowGroupMode="subheader"
        groupRowsBy="CONCEPT_NAME"
        class="table self-start"
        v-if="concepts.length && !loading"
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="concepts"
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
      <div
        v-if="!concepts.length && !loading"
        class="placeholder table-placeholder"
      >
        Add at least one concept to display the results
      </div>
      <ProgressCircle v-if="loading" />
    </div>
  </Panel>
  <ConceptSearchForm
    :added-concepts="selectedConcept"
    :success-message="successMessage"
    :errors="errors"
    @close="close"
    @inputChanged="clearMessages"
    :show="showWebApiSearchForm"
    multi-selection
    @save="save"
    @missingConceptsChanged="handleFailedLoading"
  />
</template>

<script setup lang="ts">
import { ConceptSearchForm } from "@/widgets/conceptSearchForm";
import "./index.css";

import { computed, Ref, ref } from "vue";
import { useStore } from "vuex";
import Panel from "primevue/panel";
import Button from "primevue/button";
import { helpers } from "@/shared/lib/mixins";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { webApiActions } from "@/shared/api/webAPI";
import ProgressCircle from "@/entities/ProgressCircle.vue";
const store = useStore();

const successMessage: Ref<string[]> = ref([]);
const errors: Ref<string> = ref("");
const showWebApiSearchForm = ref(false);
const selectedConcept = ref([]);

const loading = ref(false);

const concepts = ref([]);

const handleFailedLoading = function () {
  loading.value = false;
};

const save = function () {
  const newConcept = store.getters.getData?.concept;
  concepts.value = [...concepts.value, ...newConcept];
  loading.value = false;
};
function atClick() {
  showWebApiSearchForm.value = true;
}
const clearMessages = function () {
  errors.value = "";
  successMessage.value = [];
};
const close = function (event) {
  if (event.loading) {
    loading.value = true;
  }
  showWebApiSearchForm.value = false;
  store.dispatch(webApiActions.RESET_API_STORAGE);
  successMessage.value = [];
};
</script>
<script lang="ts">
export default {
  name: "NetworkConceptDashboard",
};
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
