<template>
  <v-card :loading="!store.getters.getData" elevation="2" class="ma-4 pa-2">
    <ChartHeader title="Population by Ethnicity" />
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-ethnicity"
      :chartSpec="specEthnicity"
      :data="store.getters.getData.personData.ETHNICITY_DATA"
    />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(store.getters.getQueryIndex.PERSON.ETHNICITY_DATA)
      "
      :divider="true"
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specEthnicity } from "./specEthnicity";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();
</script>

<style scoped></style>
