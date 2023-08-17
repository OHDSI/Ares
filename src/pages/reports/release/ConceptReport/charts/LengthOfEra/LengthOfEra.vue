<template>
  <v-card
    v-if="store.getters.getData.conceptData.LENGTH_OF_ERA"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-lengthofera"
      :chartSpec="specLengthOfEra"
      :data="store.getters.getData.conceptData.LENGTH_OF_ERA"
      title="Length of Era"
    />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      link-details
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.params.domain.toUpperCase()]
            .LENGTH_OF_ERA[0]
        )
      "
      :divider="true"
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import InfoPanel from "@/widgets/infoPanel";
import { specLengthOfEra } from "./specLengthOfEra";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
