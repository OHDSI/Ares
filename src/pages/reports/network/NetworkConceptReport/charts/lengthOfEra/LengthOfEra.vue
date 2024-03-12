<template>
  <Panel header="Length of Era">
    <Chart
      id="viz-lengthofera"
      :chartSpec="specLengthOfEra"
      :data="props.data"
      width="80"
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
                  .LENGTH_OF_ERA[0]
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
import { specLengthOfEra } from "./specLengthOfEra";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { defineProps } from "vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
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
