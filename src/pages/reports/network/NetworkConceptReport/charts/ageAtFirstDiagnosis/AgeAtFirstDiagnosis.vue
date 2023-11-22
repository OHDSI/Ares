<template>
  <Panel header="Age at First Diagnosis">
    <Chart
      id="viz-ageatfirstdiagnosis"
      :chartSpec="specAgeAtFirstDiagnosis"
      :data="props.data"
      width="90"
    />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Proportion of people with at least one record per 1000 people."
        />
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Learn how
              to interpret this plot."
          @iconClicked="router.push({ name: 'help' })"
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
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
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { defineProps } from "vue";

import { specAgeAtFirstDiagnosis } from "./specAgeAtFirstDiagnosis";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
const store = useStore();
const route = useRoute();
const router = useRouter();

interface Props {
  data: DistributionType[];
}

const props = defineProps<Props>();
</script>

<style scoped></style>
