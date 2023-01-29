<template>
  <div v-if="!store.getters.getErrors">
    <v-card
      :loading="!store.getters.getData.cdmsourceData"
      elevation="10"
      class="ma-4 pa-2"
    >
      <v-card-title>CDM Source Details</v-card-title>
      <v-container v-if="store.getters.getData.cdmsourceData" fluid>
        <v-layout
          v-for="(d, i) in store.getters.getData.cdmsourceData.columns"
          :key="i"
          class="pl-8"
        >
          {{ d }}: {{ store.getters.getData.cdmsourceData[0][d] }}
        </v-layout>
      </v-container>
      <info-panel
        details="CDM Source
        Details are derived from the CDM_SOURCE table."
        :divider="true"
      ></info-panel>
      <info-panel
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        details="View export query."
        :link-details="true"
        :link="links.getSqlQueryLink(store.getters.getQueryIndex.CDM_SOURCE[0])"
        :divider="false"
      ></info-panel>
    </v-card>
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
  </div>
</template>

<script setup lang="ts">
import InfoPanel from "@/widgets/infoPanel";
import { VDataTable } from "vuetify/labs/VDataTable";
import { links } from "@/shared/config/links";

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

<style scoped>
td {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
