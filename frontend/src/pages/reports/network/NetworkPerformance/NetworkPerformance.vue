<template>
  <Pivot
    :data="store.getters.getData[NETWORK_PERFORMANCE]"
    :attributes="['TASK', 'PACKAGE', 'CATEGORY', 'SOURCE', 'TIMING']"
    :defaults="{
      rows: ['SOURCE'],
      columns: ['PACKAGE'],
    }"
    :aggregate-attrs="['TIMING']"
    :aggregator-names-list="['time']"
    :aggregators="{ time: aggregateTime() }"
  />
</template>

<script setup lang="ts">
import Pivot from "@/widgets/pivot";
import { useStore } from "vuex";
import { NETWORK_PERFORMANCE } from "@/shared/config/files";
import { formatTimestamp } from "@/shared/lib/formatters";
import Panel from "primevue/panel";

const store = useStore();

const aggregateTime = function (formatter?) {
  if (formatter == null) {
    formatter = formatTimestamp;
  }

  return function (arg) {
    const attr = arg[0];

    return function () {
      return {
        sum: 0,
        push: function (record) {
          if (record[attr]) {
            const milliseconds = parseInt(record[attr] * 1000);
            return (this.sum += milliseconds);
          }
        },
        value: function () {
          return this.sum;
        },
        format: formatter,
        numInputs: attr != null ? 0 : 1,
      };
    };
  };
};
</script>
<script lang="ts">
export default {
  name: "NetworkPerformance",
};
</script>

<style scoped>
:deep(table.pvtTable tbody tr td) {
  text-decoration: none;
  cursor: default;
}
</style>
