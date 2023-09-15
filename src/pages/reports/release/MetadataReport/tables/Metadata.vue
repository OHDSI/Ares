<template>
  <v-card
    :loading="!store.getters.getData.metadataData"
    elevation="2"
    class="ma-4"
  >
    <ChartHeader title="Metadata" />
    <v-container v-if="store.getters.getData.metadataData" fluid>
      <v-data-table
        v-if="store.getters.getData"
        class="mt-4"
        dense
        :headers="headers"
        :items="store.getters.getData.metadataData"
      >
      </v-data-table>
    </v-container>
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="Metadata is
        derived from the METADATA table."
      />
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(store.getters.getQueryIndex.METADATA[0])
          )
        "
      />
    </v-toolbar>
  </v-card>
</template>

<script setup lang="ts">
import { links } from "@/shared/config/links";
import { VDataTable } from "vuetify/labs/VDataTable";

import { useStore } from "vuex";
import { ref, Ref } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { helpers } from "@/shared/lib/mixins";

const store = useStore();

const headers: Ref<DataTableHeader[]> = ref([
  {
    title: "METADATA_CONCEPT_ID",
    sortable: true,
    key: "METADATA_CONCEPT_ID",
    align: "start",
  },
  {
    title: "NAME",
    sortable: true,
    key: "NAME",
    align: "start",
  },
  {
    title: "VALUE_AS_STRING",
    sortable: true,
    key: "VALUE_AS_STRING",
    align: "start",
  },
  {
    title: "VALUE_AS_CONCEPT_ID",
    sortable: true,
    key: "VALUE_AS_CONCEPT_ID",
    align: "start",
  },
  {
    title: "METADATA_DATE",
    sortable: true,
    key: "METADATA_DATE",
    align: "start",
  },
  {
    title: "METADATA_DATETIME",
    sortable: true,
    key: "METADATA_DATETIME",
    align: "start",
  },
]);
</script>

<style scoped></style>
