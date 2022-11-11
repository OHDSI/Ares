<template>
  <v-container fluid>
    <v-card>
      <Pivot
        :data="getData['networkPerformance']"
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

<script>
import Pivot from "@/widgets/pivot";
import { mapGetters } from "vuex";
export default {
  name: "NetworkPerformance",
  components: { Pivot },
  methods: {
    aggregateTime: function (formatter) {
      if (formatter == null) {
        formatter = this.formatTime;
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
    },
    formatTime: (function () {
      return function (x) {
        let seconds = Math.floor((x / 1000) % 60),
          minutes = Math.floor((x / (1000 * 60)) % 60),
          hours = Math.floor((x / (1000 * 60 * 60)) % 24);

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
      };
    })(),
  },
  computed: {
    ...mapGetters(["getData"]),
  },
};
</script>

<style scoped>
>>> table.pvtTable tbody tr td {
  text-decoration: none;
  cursor: default;
}
</style>
