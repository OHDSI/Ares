<template>
  <Panel header="Visit Duration By Type">
    <Chart
      id="viz-visitdurationbytype"
      :chartSpec="specVisitDurationByType"
      :data="props.data"
      width="90"
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
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .VISIT_DURATION_BY_TYPE[0]
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
import { specVisitDurationByType } from "./specVisitDurationByType";
import { useStore } from "vuex";
import { defineProps } from "vue";
import { useRoute } from "vue-router";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";
import { mdiCodeBraces } from "@mdi/js";
import Panel from "primevue/panel";

interface Props {
  data: DistributionType[];
}

const props = defineProps<Props>();

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
