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
    minMax: { type: Boolean, required: false, default: false },
  },
  data() {
    return {
      processedConfig: null,
      toggleMode: null,
    };
  },
  computed: {
    style: function () {
      return "width: " + this.width + "%";
    },
    ...mapGetters(["getSettings"]),
    darkMode: function () {
      return this.getSettings.darkMode;
    },
    zeroBaseline: function () {
      return this.getSettings.zeroBaseline;
    },
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.load();
      },
    },
    darkMode() {
      this.load();
    },
    zeroBaseline() {
      this.load();
    },
  },
  created() {
    this.load();
  },
  methods: {
    getProcessedConfig: function () {
      const config = this.config(this.getSettings.zeroBaseline);
      let encoding;
      if (this.minMax) {
        encoding = config.layer[0].encoding;
        if (this.toggleMode === "MIN/MAX" || !this.toggleMode) {
          encoding.x.field = "P10_VALUE";
          encoding.x2.field = "P90_VALUE";
          this.toggleMode = "P10/P90";
        } else {
          encoding.x.field = "MIN_VALUE";
          encoding.x2.field = "MAX_VALUE";
          this.toggleMode = "MIN/MAX";
        }
      }
      this.processedConfig = config;
    },
    toggleMinMax() {
      if (!this.minMax) {
        throw new Error("Add the minMax prop to VegaChart");
      }
      this.load();
      this.$emit("minMaxChanged", this.toggleMode);
    },
    load: function () {
      this.getProcessedConfig();
      embed(
        `#${this.id}`,
        {
          ...this.processedConfig,
          data: { values: this.data },
        },
        { theme: this.getSettings.darkMode ? "dark" : "" }
      ).then((result) => {
        if (this.listener) {
          this.listener(result, this.$route);
        }
      });
    },
  },
};
</script>

<style scoped></style>
