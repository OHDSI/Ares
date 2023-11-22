<template>
  <Panel header="Age at First Observation by Sex">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-agebysex"
      :chartSpec="specAgeBySex"
      :data="store.getters.getData.observationPeriodData.AGE_BY_GENDER"
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
                store.getters.getQueryIndex.OBSERVATION_PERIOD.AGE_BY_GENDER[0]
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
import { specAgeBySex } from "./specAgeBySex";
import { useStore } from "vuex";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";

const store = useStore();
</script>

<style scoped></style>
