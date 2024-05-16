<template>
  <Panel
    header="Observation Periods per Person"
    v-if="store.getters.dataInStore"
  >
    <DataTable
      removable-sort
      size="small"
      :value="store.getters.getData.personPeriods"
      paginator
      :rows="5"
      :rowsPerPageOptions="[5, 10, 20, 50]"
    >
      <Column
        sortable
        field="CONCEPT_NAME"
        header="Number of Observation Periods"
      ></Column>
      <Column sortable field="COUNT_VALUE" header="Number of People">
        <template #body="slotProps">
          {{ helpers.formatComma(slotProps.data.COUNT_VALUE) }}
        </template>
      </Column>
      <Column sortable field="PERCENT_PEOPLE" header="% of People">
        <template #body="slotProps">
          {{ slotProps.data.PERCENT_PEOPLE }}%
        </template>
      </Column>
    </DataTable>

    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .PERSON_PERIODS_DATA[0]
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
import { helpers } from "@/shared/lib/mixins";
import { useStore } from "vuex";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";

const store = useStore();
</script>

<style scoped></style>
