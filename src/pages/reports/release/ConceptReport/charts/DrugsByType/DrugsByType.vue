<template>
  <Panel
    header="Drugs by Type"
    v-if="store.getters.getData.conceptData.DRUGS_BY_TYPE"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-drugsbytype"
      :chartSpec="specDrugsByType"
      :data="store.getters.getData.conceptData.DRUGS_BY_TYPE"
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
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
