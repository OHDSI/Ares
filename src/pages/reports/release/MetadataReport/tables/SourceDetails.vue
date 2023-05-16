<template>
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
</template>

<script setup lang="ts">
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";

const store = useStore();
</script>

<style scoped></style>
