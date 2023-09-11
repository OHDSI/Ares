<template>
  <v-card :loading="!store.getters.dataInStore" elevation="2" class="ma-4">
    <ChartHeader title="Age at First Observation" />
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-networkageatfirstobservation"
      :chartSpec="specAgeAtFirstObservation"
      :data="store.getters.getData.allAgeAtFirstObservationData"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex.OBSERVATION_PERIOD
                .AGE_AT_FIRST_OBSERVATION[0]
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

import { specAgeAtFirstObservation } from "./specAgeAtFirstObservation";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const store = useStore();
</script>

<style scoped></style>
