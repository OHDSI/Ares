<template>
  <v-btn :block="block" color="primary" small @click="back">
    <v-icon>mdi-arrow-left</v-icon>
    Back
  </v-btn>
</template>

<script>
export default {
  name: "ReturnButton",
  props: {
    block: Boolean,
  },
  methods: {
    back: function () {
      this.$router.back();
    },
  },
};
</script>

<style scoped></style>
