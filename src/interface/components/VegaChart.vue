<template>
  <div>
    <v-card-title v-if="title">{{ title }}</v-card-title>
    <div :id="id" :style="style"></div>
  </div>
</template>

<script>
import embed from "vega-embed";
import { mapGetters } from "vuex";

export default {
  name: "VegaChart",
  props: {
    title: { type: String, required: false, default: null },
    data: { type: Array, required: true, default: null },
    config: { type: Function, required: true, default: null },
    id: { type: String, required: true, default: null },
    listener: { type: Function, required: false, default: null },
    width: { type: String, required: false, default: "90" },
  },
  computed: {
    processedConfig: function () {
      return {
        ...this.config(this.getSettings.zeroBaseline, this.getSettings.minMax),
        data: { values: this.data },
      };
    },
    darkMode: function () {
      return this.getSettings.darkMode;
    },
    style: function () {
      return "width: " + this.width + "%";
    },
    ...mapGetters(["getSettings"]),
  },
  watch: {
    darkMode() {
      this.load();
    },
    processedConfig: {
      deep: true,
      handler() {
        this.load();
      },
    },
  },
  created() {
    this.load();
  },
  methods: {
    load: function () {
      embed(`#${this.id}`, this.processedConfig, {
        theme: this.getSettings.darkMode ? "dark" : "",
      }).then((result) => {
        if (this.listener) {
          this.listener(result, this.$route);
        }
      });
    },
  },
};
</script>

<style scoped></style>
