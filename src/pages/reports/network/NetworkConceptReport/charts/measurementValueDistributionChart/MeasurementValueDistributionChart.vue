<template>
  <Panel header="Measurement Value Distributions by Database and Unit">
    <div class="pa-4">
      <MultiSelect
        v-model="selectedMeasurementUnits"
        class="mr-13"
        :options="getMeasurementUnits"
        variant="outlined"
        hide-selected
        closable-chips
        chips
        label="Filter units"
        multiple
      ></MultiSelect>
    </div>
    <Chart
      id="viz-networkmeasurementvaluedistribution"
      ref="measurementvalue"
      :chartSpec="specMeasurementValueDistribution"
      :data="getSelectedMeasurementUnits ? getSelectedMeasurementUnits : []"
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
                store.getters.getQueryIndex.MEASUREMENT
                  .MEASUREMENT_VALUE_DISTRIBUTION[0]
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
import { specMeasurementValueDistribution } from "./specMeasurementValueDistribution";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { computed, ref, Ref, defineProps } from "vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { useRouter } from "vue-router";
import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";
import Panel from "primevue/panel";
import MultiSelect from "primevue/multiselect";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";

const store = useStore();
const router = useRouter();

interface Props {
  data: DistributionType[];
}

const props = defineProps<Props>();

const getMeasurementUnits = computed(function () {
  return [...new Set(props.data.map((value) => value.CATEGORY))];
});

const selectedMeasurementUnits: Ref<string[]> = ref([]);

const getSelectedMeasurementUnits = computed(function () {
  return selectedMeasurementUnits.value.length
    ? props.data.filter((value) =>
        selectedMeasurementUnits.value.includes(value.CATEGORY)
      )
    : props.data;
});
</script>

<style scoped></style>
