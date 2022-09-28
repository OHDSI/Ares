<template>
  <v-menu
    v-model="chooseHeaderMenu"
    bottom
    :close-on-content-click="false"
    :offset-y="true"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" v-bind="attrs" v-on="on">
        <v-icon dark left>mdi-view-column-outline</v-icon>
        Choose Columns to Display
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item v-for="(h, i) in headers" :key="i">
        <v-checkbox
          v-model="h.show"
          :label="h.text"
          :value="h.show"
          hide-details="auto"
        ></v-checkbox>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: "SelectColumns",
  props: {
    headers: { type: Array, required: true, default: null },
    value: { type: Array, required: false, default: () => [] },
  },
  data() {
    return {
      chooseHeaderMenu: false,
      content: this.value,
    };
  },
};
</script>

<style scoped></style>
