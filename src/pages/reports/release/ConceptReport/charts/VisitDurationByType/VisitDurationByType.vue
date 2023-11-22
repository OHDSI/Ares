<template>
  <Panel
    header="Visit Duration By Type"
    v-if="store.getters.getData.conceptData.VISIT_DURATION_BY_TYPE"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-visitdurationbytype"
      :chartSpec="specVisitDurationByType"
      :data="store.getters.getData.conceptData.VISIT_DURATION_BY_TYPE"
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
import { useRoute } from "vue-router";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
