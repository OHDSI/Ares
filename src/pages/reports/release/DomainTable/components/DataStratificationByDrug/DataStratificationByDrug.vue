<template>
  <Panel
    header="Drug Domain Stratification by Drug Type"
    v-if="route.params.domain.toUpperCase() === 'DRUG_EXPOSURE' && data"
  >
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Chart
      v-if="store.getters.dataInStore && data"
      id="viz-stratificationbydrugtype"
      :chartSpec="specDrugTypeStratification"
      :data="data"
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
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { specDrugTypeStratification } from "./specDrugTypeStratification";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
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
  return store.getters.getData.drugStratification;
});
</script>

<style scoped></style>
