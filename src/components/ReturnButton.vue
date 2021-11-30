<template>
  <div class="back-button" @click="$router.go(-1)">
    <v-icon>mdi-arrow-left-bottom</v-icon>
    <div>Back</div>
  </div>
</template>

<script>
export default {
  name: "ReturnButton"
}
</script>

<style scoped>
  .back-button {
    cursor: pointer;
  }
</style>