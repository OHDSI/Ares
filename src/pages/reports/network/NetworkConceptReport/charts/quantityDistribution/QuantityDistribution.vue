<template>
  <Panel header="Quantity">
    <Chart
      id="viz-quantity"
      :chartSpec="specQuantity"
      :data="props.data"
      width="95"
    />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Learn how
              to interpret this plot."
          @iconClicked="router.push({ name: 'help' })"
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .QUANTITY_DISTRIBUTION[0]
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
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { specQuantity } from "./specQuantity";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
const store = useStore();
const route = useRoute();
const router = useRouter();
import Panel from "primevue/panel";

import { defineProps } from "vue";
import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";

interface Props {
  data: DistributionType[];
}

const props = defineProps<Props>();
</script>

<style scoped></style>
