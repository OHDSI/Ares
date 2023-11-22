<template>
  <Panel header="Drugs by Type">
    <Chart
      id="viz-drugsbytype"
      :chartSpec="specDrugsByType"
      :data="props.data"
      width="90"
    />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Learn about drug types."
          @iconClicked="helpers.openNewTab(links.getDocsLink('DRUG_EXPOSURE'))"
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .DRUGS_BY_TYPE[0]
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
import { specDrugsByType } from "./specDrugsByType";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

import { defineProps } from "vue";
import { RecordsCountType } from "@/processes/exploreReports/model/interfaces/reportTypes/RecordsCountType";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import Panel from "primevue/panel";

interface Props {
  data: RecordsCountType[];
}

const props = defineProps<Props>();

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
