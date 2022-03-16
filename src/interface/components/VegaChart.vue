<template>
  <div>
    <v-card-title v-if="title">{{ title }}</v-card-title>
    <div :id="id" :style="style"></div>
  </div>
</template>

<script>
import embed from "vega-embed";

export default {
  name: "VegaChart",
  props: {
    title: { type: String, required: false, default: null },
    data: { type: Array, required: true, default: null },
    config: { type: Object, required: true, default: null },
    id: { type: String, required: true, default: null },
    listener: { type: Function, required: false, default: null },
    width: { type: String, required: false, default: "90" },
  },
  computed: {
    style: function () {
      return "width: " + this.width + "%";
    },
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.load();
      },
    },
    config: {
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
      embed(`#${this.id}`, {
        ...this.config,
        data: { values: this.data },
      }).then((result) => {
        if (this.listener) {
          this.listener(result);
        }
      });
    },
  },
};
</script>

<style scoped></style>
