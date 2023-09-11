<template>
  <v-card
    v-if="store.getters.getData.conceptData.CONDITIONS_BY_TYPE"
    :loading="!store.getters.dataInStore"
    elevation="2"
    class="ma-4"
  >
    <ChartHeader title="Conditions by Type" />
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-conditionsbytype"
      :chartSpec="specConditionsByType"
      :data="store.getters.getData.conceptData.CONDITIONS_BY_TYPE"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="Learn about Condition types."
        @iconClicked="
          helpers.openNewTab(links.getDocsLink('CONDITION_OCCURRENCE'))
        "
      />
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                .CONDITIONS_BY_TYPE[0]
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

import { specConditionsByType } from "./specConditionsByType";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
