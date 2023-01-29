<template>
  <v-container fluid>
    <v-card>
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
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import Pivot from "@/widgets/pivot";
import { useStore } from "vuex";
import { NETWORK_PERFORMANCE } from "@/shared/config/files";

const store = useStore();

const aggregateTime = function (formatter?) {
  if (formatter == null) {
    formatter = formatTime;
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
const formatTime = (function () {
  return function (x) {
    let seconds = Math.floor((x / 1000) % 60),
      minutes = Math.floor((x / (1000 * 60)) % 60),
      hours = Math.floor((x / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
  };
})();
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
