<template>
  <Panel
    header="Record Count Proportion By Age, Sex, Year"
    :loading="!store.getters.dataInStore"
  >
    <Chart
      v-if="store.getters.getData"
      id="viz-recordproportionbyagesexyear"
      width="90"
      :chartSpec="specRecordProportionByAgeSexYear"
      :data="store.getters.getData.conceptData.PREVALENCE_BY_GENDER_AGE_YEAR"
    />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Proportion of people with at least one record per 1000 people."
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .PREVALENCE_BY_GENDER_AGE_YEAR[0]
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
import { useRoute } from "vue-router";

import { specRecordProportionByAgeSexYear } from "./specRecordProportionByAgeSexYear";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
