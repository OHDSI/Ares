<template>
  <v-container fluid ma-2 pa-4>
    <v-row>
      <v-col cols="2">CDM Source Name</v-col>
      <v-col>{{ store.getters.getData.cdmSourceName }}</v-col>
    </v-row>
    <v-row>
      <v-col cols="2">Description</v-col>
      <v-col>{{ store.getters.getData.sourceDescription }}</v-col>
    </v-row>
    <v-row>
      <v-col cols="2">Licensee</v-col>
      <v-col>{{ store.getters.getData.cdmHolder }}</v-col>
    </v-row>
    <v-row>
      <v-col cols="2">Source Released</v-col>
      <v-col>{{ store.getters.getData.sourceReleaseDate }}</v-col>
    </v-row>
    <v-row>
      <v-col cols="2">CDM Released</v-col>
      <v-col>{{ store.getters.getData.cdmReleaseDate }}</v-col>
    </v-row>
    <v-row>
      <v-col cols="2">CDM Version</v-col>
      <v-col>{{ store.getters.getData.cdmVersion }}</v-col>
    </v-row>
    <v-row>
      <v-col cols="2">DQD Version</v-col>
      <v-col>{{ store.getters.getData.dqdVersion }}</v-col>
    </v-row>
    <v-row>
      <v-col cols="2">Vocabulary Version</v-col>
      <v-col>{{ store.getters.getData.vocabularyVersion }}</v-col>
    </v-row>
    <v-row>
      <v-col cols="2">Source Documentation</v-col>
      <v-col>
        {{ store.getters.getData.sourceDocumentationReference }}
        <a
          :href="store.getters.getData.sourceDocumentationReference"
          target="_blank"
        >
          <v-icon right small color="primary">mdi-open-in-new</v-icon>
        </a>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="2">ETL Reference</v-col>
      <v-col>
        {{ store.getters.getData.cdmEtlReference }}
        <a :href="store.getters.getData.cdmEtlReference" target="_blank">
          <v-icon right small color="primary">mdi-open-in-new</v-icon>
        </a>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useStore } from "vuex";

const store = useStore();
</script>

<style scoped></style>
