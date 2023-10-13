<template>
  <v-card elevation="2" class="ma-4">
    <ChartHeader title="Length of Era" />

    <Chart
      id="viz-lengthofera"
      :chartSpec="specLengthOfEra"
      :data="props.data"
      width="80"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                .LENGTH_OF_ERA[0]
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
import { specLengthOfEra } from "./specLengthOfEra";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { defineProps } from "vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";

interface Props {
  data: DistributionType[];
}

const props = defineProps<Props>();
const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
