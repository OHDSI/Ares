<template>
  <v-container fluid>
    <v-alert elevation="4" prominent type="error" icon="mdi-cloud-alert" title="An error has occurred">
      <ul>
        <li v-for="(error, index) in store.getters.getErrors" :key="index">
          <span style="color: white">{{ error.message }}</span> --
          <span style="color: white">{ {{ error.details }} }</span>
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
