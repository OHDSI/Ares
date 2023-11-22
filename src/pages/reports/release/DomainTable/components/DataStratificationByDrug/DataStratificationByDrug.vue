<template>
  <Panel
    header="Drug Domain Stratification by Drug Type"
    v-if="
      route.params.domain.toUpperCase() === 'DRUG_EXPOSURE' &&
      store.getters.getData.drugStratification
    "
  >
    <Chart
      v-if="
        store.getters.dataInStore && store.getters.getData.drugStratification
      "
      id="viz-stratificationbydrugtype"
      :chartSpec="specDrugTypeStratification"
      :data="store.getters.getData.drugStratification"
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
                store.getters.getQueryIndex.DOMAIN_SUMMARY
                  .DOMAIN_DRUG_STRATIFICATION
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
import { specDrugTypeStratification } from "./specDrugTypeStratification";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
