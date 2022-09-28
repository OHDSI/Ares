<template>
  <div v-if="!getErrors">
    <v-card :loading="!getData.cdmsourceData" elevation="10" class="ma-4 pa-2">
      <v-card-title>CDM Source Details</v-card-title>
      <v-container v-if="getData.cdmsourceData" fluid>
        <v-layout
          v-for="(d, i) in getData.cdmsourceData.columns"
          :key="i"
          class="pl-8"
        >
          {{ d }}: {{ getData.cdmsourceData[0][d] }}
        </v-layout>
      </v-container>
      <info-panel
        details="CDM Source
        Details are derived from the CDM_SOURCE table."
        :divider="true"
      ></info-panel>
      <info-panel
        v-if="getQueryIndex"
        icon="mdi-code-braces"
        details="View export query."
        :link-details="true"
        :link="getSqlQueryLink(getQueryIndex.CDM_SOURCE[0])"
        :divider="false"
      ></info-panel>
    </v-card>
    <v-card :loading="!getData.metadataData" elevation="10" class="ma-4 pa-2">
      <v-card-title>Metadata</v-card-title>
      <v-container v-if="getData.metadataData" fluid>
        <v-data-table
          v-if="getData"
          class="mt-4"
          dense
          :headers="headers"
          :items="getData.metadataData"
        >
        </v-data-table>
      </v-container>
      <info-panel
        details="Metadata is
        derived from the METADATA table."
        :divider="true"
      ></info-panel>
      <info-panel
        v-if="getQueryIndex"
        icon="mdi-code-braces"
        details="View export query."
        :link-details="true"
        :link="getSqlQueryLink(getQueryIndex.METADATA[0])"
        :divider="false"
      ></info-panel>
    </v-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import infoPanel from "@/widgets/infoPanel";
import { mixins } from "@/shared/lib/mixins";
import { getLinks } from "@/shared/config/links";

export default {
  components: { infoPanel },
  mixins: [mixins, getLinks],
  data: function () {
    return {
      search: "",
      headers: [
        {
          text: "METADATA_CONCEPT_ID",
          sortable: true,
          value: "METADATA_CONCEPT_ID",
          align: "start",
        },
        {
          text: "NAME",
          sortable: true,
          value: "NAME",
          align: "start",
        },
        {
          text: "VALUE_AS_STRING",
          sortable: true,
          value: "VALUE_AS_STRING",
          align: "start",
        },
        {
          text: "VALUE_AS_CONCEPT_ID",
          sortable: true,
          value: "VALUE_AS_CONCEPT_ID",
          align: "start",
        },
        {
          text: "METADATA_DATE",
          sortable: true,
          value: "METADATA_DATE",
          align: "start",
        },
        {
          text: "METADATA_DATETIME",
          sortable: true,
          value: "METADATA_DATETIME",
          align: "start",
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "getQueryIndex"]),
  },
};
</script>

<style scoped>
td {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
