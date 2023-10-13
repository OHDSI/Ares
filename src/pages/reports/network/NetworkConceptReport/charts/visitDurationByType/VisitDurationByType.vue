<template>
  <v-card elevation="2" class="ma-4">
    <ChartHeader title="Visit Duration By Type" />

    <Chart
      id="viz-visitdurationbytype"
      :chartSpec="specVisitDurationByType"
      :data="props.data"
      width="90"
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
                .VISIT_DURATION_BY_TYPE[0]
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
import { specVisitDurationByType } from "./specVisitDurationByType";
import { useStore } from "vuex";
import { defineProps } from "vue";
import { useRoute } from "vue-router";
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
