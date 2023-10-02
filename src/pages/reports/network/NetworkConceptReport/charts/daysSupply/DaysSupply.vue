<template>
  <v-card elevation="2" class="ma-4">
    <ChartHeader title="Days Supply" />

    <Chart
      id="viz-dayssupply"
      :chartSpec="specDaysSupply"
      :data="props.data"
      width="95"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="Learn how to interpret this plot"
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
                .DAYS_SUPPLY_DISTRIBUTION[0]
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

import { specDaysSupply } from "./specDaysSupply";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";
import { defineProps } from "vue";

interface Props {
  data: DistributionType[];
}

const props = defineProps<Props>();

const store = useStore();
const route = useRoute();
const router = useRouter();
</script>

<style scoped></style>
