<template>
  <v-card elevation="2" class="ma-4">
    <ChartHeader title="Quantity" />

    <Chart
      id="viz-quantity"
      :chartSpec="specQuantity"
      :data="props.data"
      width="95"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="Learn how
              to interpret this plot."
        @iconClicked="router.push({ name: 'help' })"
      />
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                .QUANTITY_DISTRIBUTION[0]
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
import { useRoute, useRouter } from "vue-router";
import { specQuantity } from "./specQuantity";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
const store = useStore();
const route = useRoute();
const router = useRouter();

import { defineProps } from "vue";
import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";

interface Props {
  data: DistributionType[];
}

const props = defineProps<Props>();
</script>

<style scoped></style>
