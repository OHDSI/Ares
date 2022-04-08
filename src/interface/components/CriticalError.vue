<template>
  <v-container v-if="getErrors">
    <v-alert elevation="4" text prominent type="error" icon="mdi-cloud-alert">
      <v-card-title>An error has occurred</v-card-title>
      <ul>
        <li v-for="(error, index) in getErrors" :key="index">
          <span style="color: crimson">{{ error.message }}</span> --
          <span style="color: red">{ {{ error.details }} }</span>
        </li>
      </ul>
    </v-alert>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "ErrorAlert",
  computed: {
    ...mapGetters(["getErrors"])
  }
};
</script>
<style scoped></style>
