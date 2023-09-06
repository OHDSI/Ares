<template>
  <v-card :loading="!store.getters.getData" elevation="2" class="ma-4">
    <ChartHeader title="Population by Ethnicity" />
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-ethnicity"
      :chartSpec="specEthnicity"
      :data="store.getters.getData.personData.ETHNICITY_DATA"
    />
    <v-toolbar density="compact" class="mt-6">
      <ExportQueryLink :query-index="store.getters.getQueryIndex.PERSON.ETHNICITY_DATA" />
    </v-toolbar>    
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specEthnicity } from "./specEthnicity";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import ExportQueryLink from "@/widgets/exportQueryLink/ui/ExportQueryLink.vue";

const store = useStore();
</script>

<style scoped></style>
