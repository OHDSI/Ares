<template>
  <v-card
    v-if="route.params.domain.toUpperCase() === 'VISIT_OCCURRENCE'"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="
        store.getters.dataInStore && store.getters.getData.domainStratification
      "
      id="viz-stratificationbyvisit"
      :config="specVisitStratification"
      :data="store.getters.getData.domainStratification"
      title="Domain Data Stratification by Visit"
    />
    <info-panel
      details="Any domain data categorized as a Visit of 'No matching concept' implies
        that this data had no associated Visit on the Domain record."
      :divider="true"
    ></info-panel>
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :divider="false"
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
import { specVisitStratification } from "./specVisitStratification";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
