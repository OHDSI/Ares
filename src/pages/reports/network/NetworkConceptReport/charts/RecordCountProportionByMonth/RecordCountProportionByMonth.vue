<template>
  <Panel header="Record Count Proportion by Month">
    <Chart
      v-if="store.getters.dataInStore"
      :id="reportId"
      width="85"
      :chartSpec="specRecordProportionByMonth"
      :data="props.data"
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
                  .PREVALENCE_BY_MONTH[0]
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
import { specRecordProportionByMonth } from "./specRecordProportionByMonth";
import { useStore } from "vuex";
import { defineProps } from "vue";
import { useRoute } from "vue-router";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import Panel from "primevue/panel";

interface Props {
  data: [];
}

const props = defineProps<Props>();

const store = useStore();
const route = useRoute();

const reportId = "viz-networkrecordproportionbymonth";
</script>

<style scoped></style>
