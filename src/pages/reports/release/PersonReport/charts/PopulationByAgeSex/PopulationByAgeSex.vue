<template>
  <v-card :loading="!store.getters.getData" elevation="2" class="ma-4">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-populationbyageandsex"
      title="Population by Age &amp; Sex"
      width="90"
      :data="store.getters.getData.personData.AGE_GENDER_DATA"
      :chartSpec="specAgeSex"
    />
    <v-divider inset class="pa-1"></v-divider>
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex.PERSON.AGE_GENDER_DATA
        )
      "
      :divider="true"
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specAgeSex } from "./specAgeSex";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { computed } from "vue";

const store = useStore();
const notes = computed(() => {
  const sourceName = store.getters.getSelectedSource.cdm_source_key;
  const releaseName = store.getters.getSelectedRelease.release_id;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  const releaseContainer = sourceContainer[releaseName] || {};
  return releaseContainer["viz-populationbyageandsex"] || [];
});
</script>

<style scoped></style>
