<template>
  <v-container>
    <v-alert elevation="4" text prominent type="error" icon="mdi-cloud-alert"
      ><v-card-title>{{ text }}</v-card-title
      ><v-card-text>{{ details }}</v-card-text></v-alert
    >
  </v-container>
</template>

<script>
export default {
  props: ["text", "details"],
  data() {
    return {};
  },
  created() {},
  name: "error",
};
</script>

<style scoped>
</style>
