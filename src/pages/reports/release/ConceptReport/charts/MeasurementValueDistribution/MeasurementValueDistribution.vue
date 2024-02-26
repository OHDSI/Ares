<template>
  <Panel
    header="Measurement Value Distributions By Unit"
    v-if="store.getters.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION"
  >
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <MultiSelect
      v-model="selectedMeasurementUnits"
      class="mr-13"
      :items="getMeasurementUnits"
      attach
      variant="outlined"
      hide-selected
      closable-chips
      chips
      label="Filter units"
      multiple
    ></MultiSelect>

    <Chart
      v-if="store.getters.dataInStore"
      id="viz-measurementvaluedistribution"
      ref="measurementvalue"
      :chartSpec="specMeasurementValueDistribution"
      :data="getSelectedMeasurementUnits"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        removable-sort
        size="small"
        paginator
        :value="store.getters.getData.measurementTable"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <template #empty> No concepts found </template>
        <Column sortable header="Unit ID" field="CATEGORY"></Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="MIN_VALUE"
          field="MIN_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.MIN_VALUE
                  ? helpers.formatComma(slotProps.data.MIN_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P10_VALUE"
          field="P10_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.P10_VALUE
                  ? helpers.formatComma(slotProps.data.P10_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P25_VALUE"
          field="P25_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.P25_VALUE
                  ? helpers.formatComma(slotProps.data.P25_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="MEDIAN_VALUE"
          field="MEDIAN_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.MEDIAN_VALUE
                  ? helpers.formatComma(slotProps.data.MEDIAN_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P75_VALUE"
          field="P75_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.P75_VALUE
                  ? helpers.formatComma(slotProps.data.P75_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P90_VALUE"
          field="P90_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.P90_VALUE
                  ? helpers.formatComma(slotProps.data.P90_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="MAX_VALUE"
          field="MAX_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.MAX_VALUE
                  ? helpers.formatComma(slotProps.data.MAX_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Count value"
          field="UNIT_COUNT"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.UNIT_COUNT
                  ? helpers.formatComma(slotProps.data.UNIT_COUNT)
                  : 0
              }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiCheckNetwork"
          tooltip="Check measurement value distributions across the network"
          @iconClicked="router.push(getNetworkConceptRoute())"
        />
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

import { links } from "@/shared/config/links";
import { specMeasurementValueDistribution } from "./specMeasurementValueDistribution";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { computed, ref, Ref } from "vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCheckNetwork, mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const selectedMeasurementUnits: Ref<string[]> = ref([]);

const getMeasurementUnits = computed((): string[] => {
  if (store.getters.getData?.conceptData?.MEASUREMENT_VALUE_DISTRIBUTION) {
    return store.getters.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION.map(
      (value) => value.CATEGORY
    );
  } else {
    return [];
  }
});

const getSelectedMeasurementUnits = computed((): string[] => {
  if (store.getters.getData?.conceptData?.MEASUREMENT_VALUE_DISTRIBUTION) {
    return selectedMeasurementUnits.value.length
      ? store.getters.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION.filter(
          (value) => selectedMeasurementUnits.value.includes(value.CATEGORY)
        )
      : store.getters.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION;
  } else {
    return [];
  }
});

const getNetworkConceptRoute = function (): object {
  return {
    name: "networkConcept",
    params: {
      domain: route.params.domain,
      concept: route.params.concept,
    },
  };
};

const store = useStore();
const route = useRoute();
const router = useRouter();

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return store.getters.getData.conceptData.MEASUREMENTS_BY_TYPE;
});
</script>

<style scoped></style>
