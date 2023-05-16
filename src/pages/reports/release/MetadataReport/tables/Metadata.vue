<template>
  <v-card
    :loading="!store.getters.getData.metadataData"
    elevation="10"
    class="ma-4 pa-2"
  >
    <v-card-title>Metadata</v-card-title>
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
    <info-panel
      details="Metadata is
        derived from the METADATA table."
      :divider="true"
    ></info-panel>
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="links.getSqlQueryLink(store.getters.getQueryIndex.METADATA[0])"
      :divider="false"
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { links } from "@/shared/config/links";
import { VDataTable } from "vuetify/labs/VDataTable";
import InfoPanel from "@/widgets/infoPanel";
import { useStore } from "vuex";
import { ref, Ref } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";

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
