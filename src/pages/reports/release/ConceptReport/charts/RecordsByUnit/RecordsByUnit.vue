<template>
  <Panel
    header="Records By Unit"
    v-if="store.getters.getData.conceptData.RECORDS_BY_UNIT"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-recordsbyunit"
      :chartSpec="specRecordsByUnit"
      :data="store.getters.getData.conceptData.RECORDS_BY_UNIT"
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
                  .RECORDS_BY_UNIT[0]
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
import { specRecordsByUnit } from "./specRecordsByUnit";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
