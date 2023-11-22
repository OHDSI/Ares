<template>
  <Panel header="Records by Unit">
    <Chart
      id="viz-recordsbyunit"
      :chartSpec="specRecordsByUnit"
      :data="props.data"
      width="85"
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
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .RECORDS_BY_UNIT[0]
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
import { specRecordsByUnit } from "./specRecordsByUnit";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { defineProps } from "vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { RecordsCountType } from "@/processes/exploreReports/model/interfaces/reportTypes/RecordsCountType";
import { mdiCodeBraces } from "@mdi/js";
import Panel from "primevue/panel";

interface Props {
  data: RecordsCountType[];
}

const props = defineProps<Props>();

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
