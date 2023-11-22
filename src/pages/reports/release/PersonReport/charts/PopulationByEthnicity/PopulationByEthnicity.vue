<template>
  <Panel
    header="Population by Ethnicity"
    :loading="!store.getters.getData"
    elevation="2"
    class="ma-4"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-ethnicity"
      :chartSpec="specEthnicity"
      :data="store.getters.getData.personData.ETHNICITY_DATA"
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
                store.getters.getQueryIndex.PERSON.ETHNICITY_DATA
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
import { specEthnicity } from "./specEthnicity";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";

const store = useStore();
</script>

<style scoped></style>
