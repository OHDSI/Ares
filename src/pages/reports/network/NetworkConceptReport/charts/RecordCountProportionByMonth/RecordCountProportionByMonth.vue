<template>
  <v-card :loading="!store.getters.dataInStore" elevation="2" class="ma-4">
    <ChartHeader title="Record Count Proportion by Month" />
    <Chart
      v-if="store.getters.dataInStore"
      :id="reportId"
      width="85"
      :chartSpec="specRecordProportionByMonth"
      :data="props.data"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="Proportion of people with at least one record per 1000 people."
      />
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                .PREVALENCE_BY_MONTH[0]
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
import { specRecordProportionByMonth } from "./specRecordProportionByMonth";
import { useStore } from "vuex";
import { defineProps } from "vue";
import { useRoute, useRouter } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

interface Props {
  data: [];
}

const props = defineProps<Props>();

const store = useStore();
const route = useRoute();

const reportId = "viz-networkrecordproportionbymonth";
</script>

<style scoped></style>
