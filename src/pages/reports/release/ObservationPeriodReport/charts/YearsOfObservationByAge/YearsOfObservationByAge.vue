<template>
  <Panel header="Years of Observation by Age">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-observationbyage"
      :chartSpec="specObservationByAge"
      :data="
        store.getters.getData.observationPeriodData
          .OBSERVATION_PERIOD_LENGTH_BY_AGE
      "
    />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .OBSERVATION_PERIOD_LENGTH_BY_AGE[0]
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
import { specObservationByAge } from "./specObservationByAge";
import { useStore } from "vuex";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";

const store = useStore();
</script>

<style scoped></style>
