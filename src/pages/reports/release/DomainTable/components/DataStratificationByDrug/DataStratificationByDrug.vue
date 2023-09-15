<template>
  <v-card
    v-if="
      route.params.domain.toUpperCase() === 'DRUG_EXPOSURE' &&
      store.getters.getData.drugStratification
    "
    :loading="!store.getters.dataInStore"
    elevation="2"
    class="ma-4"
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
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex.DOMAIN_SUMMARY
                .DOMAIN_DRUG_STRATIFICATION
            )
          )
        "
      />
    </v-toolbar>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { specDrugTypeStratification } from "./specDrugTypeStratification";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
