<template>
  <Panel
    header="Domain Data Stratification By Visit"
    v-if="route.params.domain.toUpperCase() === 'VISIT_OCCURRENCE'"
  >
    <Chart
      v-if="
        store.getters.dataInStore && store.getters.getData.domainStratification
      "
      id="viz-stratificationbyvisit"
      :chartSpec="specVisitStratification"
      :data="store.getters.getData.domainStratification"
    />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Any domain data categorized as a Visit of 'No matching concept' implies
            that this data had no associated Visit on the Domain record."
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specVisitStratification } from "./specVisitStratification";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiHelpCircle } from "@mdi/js";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
