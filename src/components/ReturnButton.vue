<template>
  <v-btn v-bind:block="block" color="blue" dark small @click="$router.back()">
    <v-icon>mdi-arrow-left</v-icon>
    Back
  </v-btn>
</template>

<script>
export default {
  name: "ReturnButton",
  props: {
    block: Boolean
  }
}
</script>

<style scoped>

</style>