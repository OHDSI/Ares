<template>
  <v-container>
    <vue-pivottable-ui class="pa-4" :data="data" :rows="rows" :cols="cols">
    </vue-pivottable-ui>
  </v-container>
</template>

<script>
import { VuePivottableUi } from "vue-pivottable";
import "./vue-pivottable.css";

export default {
  name: "Pivot",
  components: {
    VuePivottableUi,
  },
  props: {
    data: { type: Array, required: true, default: () => [] },
    rows: { type: Array, required: true, default: () => [] },
    cols: { type: Array, required: true, default: () => [] },
  },
};
</script>

<style scoped></style>
