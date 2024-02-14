<template>
  <Panel header="Conditions by Type">
    <Chart
      id="viz-conditionsbytype"
      :chartSpec="specConditionsByType"
      :data="props.data"
      width="85"
    />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Learn about Condition types."
          @iconClicked="
            helpers.openNewTab(links.getDocsLink('CONDITION_OCCURRENCE'))
          "
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .CONDITIONS_BY_TYPE[0]
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

import { defineProps } from "vue";

import { specConditionsByType } from "./specConditionsByType";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { RecordsCountType } from "@/processes/exploreReports/model/interfaces/reportTypes/RecordsCountType";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import Panel from "primevue/panel";

const store = useStore();
const route = useRoute();
interface Props {
  data: RecordsCountType[];
}

const props = defineProps<Props>();
</script>

<style scoped></style>
