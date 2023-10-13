<template>
  <v-card elevation="2" class="ma-4">
    <ChartHeader title="Measurements by Type" />
    <Chart
      id="viz-measurementsbytype"
      :chartSpec="specMeasurementsByType"
      :data="props.data"
      width="85"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="Learn about Measurement types."
        @iconClicked="helpers.openNewTab(links.getDocsLink('MEASUREMENT'))"
      />
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                .MEASUREMENTS_BY_TYPE[0]
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
import { specMeasurementsByType } from "./specMeasurementsByType";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { defineProps } from "vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { RecordsCountType } from "@/processes/exploreReports/model/interfaces/reportTypes/RecordsCountType";

interface Props {
  data: RecordsCountType[];
}

const props = defineProps<Props>();

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
