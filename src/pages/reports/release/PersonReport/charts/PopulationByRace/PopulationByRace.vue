<template>
  <Panel header="Population by Race" :loading="!store.getters.getData">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-race"
      :chartSpec="specRace"
      :data="store.getters.getData.personData.RACE_DATA"
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
                store.getters.getQueryIndex.PERSON.RACE_DATA
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
import { specRace } from "./specRace";

import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { helpers } from "@/shared/lib/mixins";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";

const store = useStore();
</script>

<style scoped></style>
