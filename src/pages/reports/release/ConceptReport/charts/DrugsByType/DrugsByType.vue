<template>
  <Panel header="Drugs by Type" v-if="data">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Chart id="viz-drugsbytype" :chartSpec="specDrugsByType" :data="data" />
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
        <Column sortable header="Drug Type" field="CONCEPT_NAME"> </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Number of Records"
          field="COUNT_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.COUNT_VALUE
                  ? helpers.formatComma(slotProps.data.COUNT_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Learn about drug types."
          @iconClicked="helpers.openNewTab(links.getDocsLink('DRUG_EXPOSURE'))"
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .DRUGS_BY_TYPE[0]
              )
            )
          "
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { specDrugsByType } from "./specDrugsByType";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { computed, ref } from "vue";
const store = useStore();
const route = useRoute();

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return store.getters.getData.conceptData.DRUGS_BY_TYPE;
});
</script>

<style scoped></style>
