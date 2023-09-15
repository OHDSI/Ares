<template>
  <v-card
    v-if="store.getters.getData.conceptData.RECORDS_BY_UNIT"
    :loading="!store.getters.dataInStore"
    elevation="2"
    class="ma-4"
  >
    <ChartHeader title="Records by Unit" />

    <Chart
      v-if="store.getters.dataInStore"
      id="viz-recordsbyunit"
      :chartSpec="specRecordsByUnit"
      :data="store.getters.getData.conceptData.RECORDS_BY_UNIT"
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
                .RECORDS_BY_UNIT[0]
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
import { specRecordsByUnit } from "./specRecordsByUnit";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
