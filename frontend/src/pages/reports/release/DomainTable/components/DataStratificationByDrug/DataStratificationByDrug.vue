<template>
  <Panel header="Drug Domain Stratification by Drug Type" v-if="showChart">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Echarts
      id="viz-stratificationbydrugtype"
      :data="data"
      :chart-spec="getEChartsOptionSpecDrugTypeStratification"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
        removable-sort
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="data"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Concept ID" field="CONCEPT_ID"> </Column>
        <Column sortable header="CONCEPT_NAME" field="CONCEPT_NAME"> </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="# Records"
          field="RECORD_COUNT"
        >
        </Column>
      </DataTable>
    </div>
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.DOMAIN_SUMMARY
                  .DOMAIN_DRUG_STRATIFICATION
              )
            )
          "
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { computed, ref, onMounted } from "vue";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsOptionSpecDrugTypeStratification from "@/pages/reports/release/DomainTable/components/DataStratificationByDrug/dataStratificationByDrug";

const store = useStore();
const route = useRoute();

const data = ref(null);

onMounted(() => {
  data.value = store.getters.getData.drugStratification;
});

const showTable = ref(false);
const showChart = computed(
  () => route.params.domain === "drug_exposure" && data.value
);

function toggleTable(mode) {
  showTable.value = mode;
}
</script>

<style scoped></style>
