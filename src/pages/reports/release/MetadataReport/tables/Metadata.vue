<template>
  <Panel header="Metadata">
    <div class="p-5" v-if="store.getters.getData.metadataData" fluid>
      <DataTable
        size="small"
        :value="store.getters.getData.metadataData"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column field="METADATA_CONCEPT_ID" header="METADATA_CONCEPT_ID">
        </Column>
        <Column field="NAME" header="NAME"> </Column>
        <Column field="VALUE_AS_STRING" header="VALUE_AS_STRING"> </Column>
        <Column field="VALUE_AS_CONCEPT_ID" header="VALUE_AS_CONCEPT_ID">
        </Column>
        <Column field="METADATA_DATE" header="METADATA_DATE"> </Column>
        <Column field="METADATA_DATETIME" header="METADATA_DATETIME"> </Column>
      </DataTable>
    </div>
    <template #footer
      ><div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Metadata is
            derived from the METADATA table."
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(store.getters.getQueryIndex.METADATA[0])
            )
          "
        /></div
    ></template>
  </Panel>
</template>

<script setup lang="ts">
import { links } from "@/shared/config/links";

import { useStore } from "vuex";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { helpers } from "@/shared/lib/mixins";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";

const store = useStore();
</script>

<style scoped></style>
