<template>
  <v-card elevation="2" class="ma-4">
    <ChartHeader title="Age at First Diagnosis" />
    <Chart
      id="viz-ageatfirstdiagnosis"
      :chartSpec="specAgeAtFirstDiagnosis"
      :data="props.data"
      width="90"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="Proportion of people with at least one record per 1000 people."
      />
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
                .AGE_AT_FIRST_DIAGNOSIS[0]
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
import { defineProps } from "vue";

import { specAgeAtFirstDiagnosis } from "./specAgeAtFirstDiagnosis";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";
const store = useStore();
const route = useRoute();
const router = useRouter();

interface Props {
  data: DistributionType[];
}

const props = defineProps<Props>();
</script>

<style scoped></style>
