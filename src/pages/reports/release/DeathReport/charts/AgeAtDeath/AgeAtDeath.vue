<template>
  <Panel header="Age at Death">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-ageatdeath"
      width="100"
      :chartSpec="specAgeAtDeath"
      :data="store.getters.getData.AGE_AT_DEATH"
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
                store.getters.getQueryIndex[route.name.toUpperCase()]
                  .AGE_AT_DEATH[0]
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
import { specAgeAtDeath } from "./specAgeAtDeath";
import { links } from "@/shared/config/links";

import { useStore } from "vuex";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
