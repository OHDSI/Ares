<template>
  <v-card
    v-if="store.getters.getData.conceptData.CONDITIONS_BY_TYPE"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-conditionsbytype"
      :config="specConditionsByType"
      :data="store.getters.getData.conceptData.CONDITIONS_BY_TYPE"
      title="Conditions by Type"
    />
    <info-panel
      details="Learn about Condition types."
      icon="mdi-help-circle"
      link-details
      :link="links.getDocsLink('CONDITION_OCCURRENCE')"
      :divider="true"
    ></info-panel>
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      link-details
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.params.domain.toUpperCase()]
            .CONDITIONS_BY_TYPE[0]
        )
      "
      divider
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import InfoPanel from "@/widgets/infoPanel";
import { specConditionsByType } from "./specConditionsByType";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
