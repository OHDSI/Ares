<template>
  <v-card
    v-if="route.params.domain.toUpperCase() === 'VISIT_OCCURRENCE'"
    :loading="!store.getters.dataInStore"
    elevation="2"
    class="ma-4"
  >
    <ChartHeader title="Domain Data Stratification by Visit" />
    <Chart
      v-if="
        store.getters.dataInStore && store.getters.getData.domainStratification
      "
      id="viz-stratificationbyvisit"
      :chartSpec="specVisitStratification"
      :data="store.getters.getData.domainStratification"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="Any domain data categorized as a Visit of 'No matching concept' implies
        that this data had no associated Visit on the Domain record."
      />
    </v-toolbar>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specVisitStratification } from "./specVisitStratification";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
