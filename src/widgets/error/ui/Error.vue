<template>
  <v-container fluid>
      <v-card-title>An error has occurred</v-card-title>
      <ul>
        <li v-for="(error, index) in store.getters.getErrors" :key="index">
          <span style="color: crimson">{{ error.message }}</span> --
          <span style="color: red">{ {{ error.details }} }</span>
        </li>
      </ul>
    </v-alert>
  </v-container>
</template>

<script lang="ts">
export default {
  name: "ErrorAlert",
};
</script>

<script setup lang="ts">
import { useStore } from "vuex";

const store = useStore();
</script>
<style scoped></style>
