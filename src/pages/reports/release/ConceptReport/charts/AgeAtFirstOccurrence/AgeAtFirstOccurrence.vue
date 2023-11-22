<template>
  <Panel
    header="Age at First Occurrence"
    v-if="store.getters.getData.conceptData.AGE_AT_FIRST_OCCURRENCE"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-ageatfirstoccurrence"
      :chartSpec="specAgeAtFirstOccurrence"
      :data="store.getters.getData.conceptData.AGE_AT_FIRST_OCCURRENCE"
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
                  .AGE_AT_FIRST_EXPOSURE[0]
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
import { specAgeAtFirstOccurrence } from "./specAgeAtFirstOccurrence";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";

const store = useStore();
const route = useRoute();
const router = useRouter();
</script>

<style scoped></style>
