<template>
  <Panel header="Age at Death">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-ageatdeath"
      width="100"
      :chartSpec="specAgeAtDeath"
      :data="store.getters.getData.AGE_AT_DEATH"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        removable-sort
        size="small"
        paginator
        :value="data"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Sex" field="CATEGORY"> </Column>
        <Column sortable header="MIN_VALUE" field="MIN_VALUE"> </Column>
        <Column sortable header="P10_VALUE" field="P10_VALUE"> </Column>
        <Column sortable header="P25_VALUE" field="P25_VALUE"> </Column>
        <Column sortable header="MEDIAN_VALUE" field="MEDIAN_VALUE"> </Column>
        <Column sortable header="P75_VALUE" field="P75_VALUE"> </Column>
        <Column sortable header="P90_VALUE" field="P90_VALUE"> </Column>
        <Column sortable header="MAX_VALUE" field="MAX_VALUE"> </Column>
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
                  .AGE_AT_DEATH[0]
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
import { specAgeAtDeath } from "./specAgeAtDeath";
import { links } from "@/shared/config/links";

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
  return store.getters.getData.AGE_AT_DEATH;
});
</script>

<style scoped></style>
