<template>
  <v-card :loading="!store.getters.dataInStore" elevation="2" class="ma-4">
    <ChartHeader title="Record Count Proportion by Age, Sex, and Year" />
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-recordproportionbyagesexyear"
      width="90"
      :chartSpec="specRecordProportionByAgeSexYear"
      :data="store.getters.getData.PREVALENCE_BY_GENDER_AGE_YEAR"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex[route.name.toUpperCase()]
                .PREVALENCE_BY_GENDER_AGE_YEAR[0]
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
import { specRecordProportionByAgeSexYear } from "./specRecordProportionByAgeSexYear";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
