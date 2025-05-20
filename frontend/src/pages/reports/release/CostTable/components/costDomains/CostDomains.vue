<template>
  <Panel header="Cost Domains" :loading="!store.getters.getData">
    <template #icons>
      <ChartHeader title="Population by Year of Birth" />
    </template>
    <Chart v-if="data" :id="reportId" :chartSpec="specCostDomains" :data="data">
    </Chart>
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
        <Column sortable header="Date" field="MONTH_YEAR"> </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="# of People"
          field="TOTAL_COST"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              $
              {{
                slotProps.data.TOTAL_COST
                  ? helpers.formatComma(slotProps.data.TOTAL_COST)
                  : "No data"
              }}
            </div>
          </template>
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
                store.getters.getQueryIndex.PERSON.BIRTH_YEAR_DATA
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
import { specCostDomains } from "./specCostDomains";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import Panel from "primevue/panel";
import { computed } from "vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { ref } from "vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { mdiCodeBraces } from "@mdi/js";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const store = useStore();

const reportId = "viz-costdomains";

const showTable = ref(false);

const data = computed(() => store.getters.getData.costTable);
</script>

<style scoped></style>
