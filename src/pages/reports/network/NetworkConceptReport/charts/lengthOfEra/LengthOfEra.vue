<template>
  <Panel header="Length of Era">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Chart id="viz-lengthofera" :chartSpec="specLengthOfEra" :data="data" />
    <div v-if="showTable" class="p-4">
      <DataTable
        removable-sort
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="data"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Source" field="SOURCE"> </Column>

        <Column sortable header="CATEGORY" field="CATEGORY"> </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="MIN_VALUE"
          field="MIN_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.MIN_VALUE
                  ? helpers.formatComma(slotProps.data.MIN_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P10_VALUE"
          field="P10_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.P10_VALUE
                  ? helpers.formatComma(slotProps.data.P10_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P25_VALUE"
          field="P25_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.P25_VALUE
                  ? helpers.formatComma(slotProps.data.P25_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="MEDIAN_VALUE"
          field="MEDIAN_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.MEDIAN_VALUE
                  ? helpers.formatComma(slotProps.data.MEDIAN_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P75_VALUE"
          field="P75_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.P75_VALUE
                  ? helpers.formatComma(slotProps.data.P75_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P90_VALUE"
          field="P90_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.P90_VALUE
                  ? helpers.formatComma(slotProps.data.P90_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="MAX_VALUE"
          field="MAX_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.MAX_VALUE
                  ? helpers.formatComma(slotProps.data.MAX_VALUE)
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
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .LENGTH_OF_ERA[0]
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
import { specLengthOfEra } from "./specLengthOfEra";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { defineProps } from "vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";
import { mdiCodeBraces } from "@mdi/js";
import Panel from "primevue/panel";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { computed, ref } from "vue";

interface Props {
  data: DistributionType[];
}

const props = defineProps<Props>();
const store = useStore();
const route = useRoute();

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return props.data;
});
</script>

<style scoped></style>
