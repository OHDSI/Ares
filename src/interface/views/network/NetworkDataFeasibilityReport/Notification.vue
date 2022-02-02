<template>
  <div class="text-center">
    <v-snackbar v-model="snackbar" color="red accent-2" :multi-line="multiLine">
      {{ text }}

      <template v-slot:action="{ attrs }">
        <v-btn color="black" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: "Notification",
  props: {
    text: { type: String, required: true, default: "" },
  },
  data() {
    return {
      multiLine: true,
      snackbar: false,
    };
  },
};
</script>

<style scoped></style>
