<template>
  <v-card
    v-if="
      route.params.domain.toUpperCase() === 'DRUG_EXPOSURE' &&
      store.getters.getData.drugStratification
    "
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <ChartHeader title="Drug Domain Stratification by Drug Type" />
    <Chart
      v-if="
        store.getters.dataInStore && store.getters.getData.drugStratification
      "
      id="viz-stratificationbydrugtype"
      :chartSpec="specDrugTypeStratification"
      :data="store.getters.getData.drugStratification"
    />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :divider="false"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex.DOMAIN_SUMMARY.DOMAIN_DRUG_STRATIFICATION
        )
      "
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import InfoPanel from "@/widgets/infoPanel";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { specDrugTypeStratification } from "./specDrugTypeStratification";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
