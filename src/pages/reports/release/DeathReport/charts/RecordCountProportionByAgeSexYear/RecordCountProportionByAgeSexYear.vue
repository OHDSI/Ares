<template>
  <Panel header="Record Count Proportion by Age, Sex, and Year">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Chart
      id="viz-recordproportionbyagesexyear"
      :chartSpec="specRecordProportionByAgeSexYear"
      :data="data"
    />
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
        <Column sortable header="Sex" field="SERIES_NAME"> </Column>
        <Column sortable header="Age Decile" field="TRELLIS_NAME"> </Column>
        <Column sortable header="Year" field="X_CALENDAR_YEAR"> </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Record Proportion Per 1000"
          field="Y_PREVALENCE_1000PP"
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
                store.getters.getQueryIndex[route.name.toUpperCase()]
                  .PREVALENCE_BY_GENDER_AGE_YEAR[0]
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
import { specRecordProportionByAgeSexYear } from "./specRecordProportionByAgeSexYear";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
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
  return store.getters.getData.PREVALENCE_BY_GENDER_AGE_YEAR;
});
</script>

<style scoped></style>
