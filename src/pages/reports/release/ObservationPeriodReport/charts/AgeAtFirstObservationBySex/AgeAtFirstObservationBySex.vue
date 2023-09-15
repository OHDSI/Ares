<template>
  <v-card :loading="!store.getters.getData" elevation="2" class="ma-4">
    <ChartHeader title="Age at First Observation by Sex" />
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-agebysex"
      :chartSpec="specAgeBySex"
      :data="store.getters.getData.observationPeriodData.AGE_BY_GENDER"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex.OBSERVATION_PERIOD.AGE_BY_GENDER[0]
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
import { specAgeBySex } from "./specAgeBySex";
import { useStore } from "vuex";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const store = useStore();
</script>

<style scoped></style>
