<template>
  <v-card :loading="!store.getters.getData" elevation="2" class="ma-4 pa-2">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-race"
      :chartSpec="specRace"
      :data="store.getters.getData.personData.RACE_DATA"
      title="Population by Race"
    />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(store.getters.getQueryIndex.PERSON.RACE_DATA)
      "
      :divider="true"
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specRace } from "./specRace";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";

const store = useStore();
</script>

<style scoped></style>
